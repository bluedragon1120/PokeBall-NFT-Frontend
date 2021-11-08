import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import {
  Card,
  CardHeader,
  CardBody,
  Flex,
  Heading,
  Text,
  Skeleton,
  Button,
  useModal,
  Box,
  CardFooter,
  ExpandableLabel,
  ButtonMenu,
  ButtonMenuItem
} from '@pancakeswap/uikit'
import { useWeb3React } from '@web3-react/core'
import { LotteryStatus } from 'config/constants/types'
import { useTranslation } from 'contexts/Localization'
import { usePriceCakeBusd } from 'state/farms/hooks'
import { useLottery } from 'state/lottery/hooks'
import { getBalanceNumber } from 'utils/formatBalance'
import Balance from 'components/Balance'
import { ROIs, DAYs } from 'config/constants/pokeConfig';
import { 
  usePokeBallContract,
  useLockedStakingContract
} from 'hooks/useContract';
import useToast from 'hooks/useToast'
import { toWei, fromWei } from 'utils/pokeHelpers';
import ViewTicketsModal from './ViewTicketsModal'
import BuyTicketsButton from './BuyTicketsButton'
import { dateTimeOptions } from '../helpers'
import RewardBrackets from './RewardBrackets'
import Row, { RowBetween } from '../../../components/Layout/Row'
import AmountField from '../AmountField'

const Grid = styled.div`
  display: grid;
  grid-template-columns: auto;

  ${({ theme }) => theme.mediaQueries.md} {
    grid-column-gap: 32px;
    grid-template-columns: auto 1fr;
  }
`

const StyledCard = styled(Card)`
  width: 100%;

  ${({ theme }) => theme.mediaQueries.sm} {
    width: 520px;
  }

  ${({ theme }) => theme.mediaQueries.md} {
    width: 756px;
  }
`

const NextDrawWrapper = styled.div`
  background: ${({ theme }) => theme.colors.background};
  padding: 24px;
`

const MenuButton = styled(ButtonMenuItem)`
  display: flex;
  flex-direction: column;
  @media screen and (max-width: 545px) {
    padding: 0px 10px;
  }
`

const HiddenDiv = styled.div`
  text-align: center;
  @media screen and (max-width: 545px) {
    display:none;
  }
`



const NextDrawCard = () => {
  const { t } = useTranslation()
  const { account } = useWeb3React()
  const [isApproved, setIsApproved] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false)
  const { toastError, toastSuccess, toastWarning } = useToast()

  const [amount, setAmount] = useState('');
  const [reward, setReward] = useState(0);
  const [accountBalance, setAccountBalance] = useState('')
  const [stakeInfo, setStakeInfo] = useState({
    reward: '0',
    yourstake: '0',
    stakeDate: '',
    redemptionDate: ''
  })

  const { currentLotteryId, isTransitioning, currentRound } = useLottery()
  const { endTime, amountCollectedInCake, userTickets, status } = currentRound

  const [onPresentViewTicketsModal] = useModal(<ViewTicketsModal roundId={currentLotteryId} roundStatus={status} />)
  const [isExpanded, setIsExpanded] = useState(false)
  const ticketBuyIsDisabled = status !== LotteryStatus.OPEN || isTransitioning

  const cakePriceBusd = usePriceCakeBusd()
  const prizeInBusd = amountCollectedInCake.times(cakePriceBusd)
  const endTimeMs = parseInt(endTime, 10) * 1000
  const endDate = new Date(endTimeMs)
  const isLotteryOpen = status === LotteryStatus.OPEN
  const userTicketCount = userTickets?.tickets?.length || 0

  const pokeBallContract = usePokeBallContract();
  const pokeLockedStakingContract = useLockedStakingContract();
  const calcDate = (days) => {
    const result = new Date();
    result.setDate(result.getDate() + days);
    const splits = result.toString().split(' ');
    splits.splice(4);
    return splits.join(' ')
    // setLastDate();
  }
  
  const [startDate, setStartDate] = useState(calcDate(0))
  const [lastDate, setLastDate] = useState(calcDate(0))
  


  const getPrizeBalances = () => {
    if (status === LotteryStatus.CLOSE || status === LotteryStatus.CLAIMABLE) {
      return (
        <Heading scale="xl" color="secondary" textAlign={['center', null, null, 'left']}>
          {t('Calculating')}...
        </Heading>
      )
    }
    return (
      <>
        {prizeInBusd.isNaN() ? (
          <Skeleton my="7px" height={40} width={160} />
        ) : (
          <Balance
            fontSize="40px"
            color="secondary"
            textAlign={['center', null, null, 'left']}
            lineHeight="1"
            bold
            prefix="~$"
            value={getBalanceNumber(prizeInBusd)}
            decimals={0}
          />
        )}
        {prizeInBusd.isNaN() ? (
          <Skeleton my="2px" height={14} width={90} />
        ) : (
          <Balance
            fontSize="14px"
            color="textSubtle"
            textAlign={['center', null, null, 'left']}
            unit=" CAKE"
            value={getBalanceNumber(amountCollectedInCake)}
            decimals={0}
          />
        )}
      </>
    )
  }

  const getNextDrawId = () => {
    if (status === LotteryStatus.OPEN) {
      return `${currentLotteryId} |`
    }
    if (status === LotteryStatus.PENDING) {
      return ''
    }
    return parseInt(currentLotteryId, 10) + 1
  }

  const getNextDrawDateTime = () => {
    if (status === LotteryStatus.OPEN) {
      return `${t('Draw')}: ${endDate.toLocaleString(undefined, dateTimeOptions)}`
    }
    return ''
  }

  const [index, setIndex] = useState(0);

  const handleClick = (newIndex) => {
    setIndex(newIndex);
    if(newIndex === 0) setLastDate(calcDate(7));
    else if(newIndex === 1) setLastDate(calcDate(14));
    else if(newIndex === 2) setLastDate(calcDate(30));
    else if(newIndex === 3) setLastDate(calcDate(90));
    else if(newIndex === 4) setLastDate(calcDate(180));
    if(newIndex === 5) setLastDate(calcDate(365));
  }

  const ticketRoundText =
    userTicketCount > 1
      ? t('You have %amount% tickets this round', { amount: userTicketCount })
      : t('You have %amount% ticket this round', { amount: userTicketCount })
  const [youHaveText, ticketsThisRoundText] = ticketRoundText.split(userTicketCount.toString())

  // Claim staked tokens
  const claim = async (e) => {
    e.preventDefault();
    // if(stakeInfo.redemptionDate === "0") {
    //   toastWarning(t('Warning'), t('You are not able to claim.'));
    //   return;
    // }

    // if(!account || !pokeLockedStakingContract || !pokeLockedStakingContract) {
    //   global.console.log('Please check your connection.')
    //   toastError(t('Error'), t('Please check your connection.'));
    //   return;
    // }
    
    setIsConfirming(true)
    // try {
    //     const tx = await pokeLockedStakingContract.claim({from: account})
    //     // const tx = await onClaim()
    //     const receipt = await tx.wait()
    //     // global.console.log(receipt, receipt.status)
    //     if (receipt.status) {
    //       toastSuccess(t('Successfully claimed!'))
    //     }
    // } catch (error) {
    //   toastError(t('Error'), t(`Please try again. ${ error.data?.message }`))

    //   // toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
    // }
    setIsConfirming(false)
  }

  // Stake tokens
  const handleStakingApprove = async (e) => {
    e.preventDefault();

    // if(stakeInfo.redemptionDate !== "0") {
    //   toastWarning(t('Warning'), t('You already staked.'));
    //   return;
    // }
    // if(!amount || amount === '') {
    //   global.console.log('Amount cannot be zero.')
    //   toastWarning(t('Warning'), t('Amount cannot be zero.'));
    //   return;
    // }

    // if(!account || !pokeLockedStakingContract || !pokeLockedStakingContract) {
    //   global.console.log('Please check your connection.')
    //   toastError(t('Error'), t('Please check your connection.'));
    //   return;
    // }

    // if(parseFloat(accountBalance) < parseFloat(amount)) {
    //   global.console.log('Insufficient value.')
    //   toastError(t('Error'), t('Insufficient value.'));
    //   return;
    // }

    setIsConfirming(true)
    // try {
    //   const totalprice = toWei(amount.toString());

    //   global.console.log(pokeLockedStakingContract.address, totalprice);
    //   if(!isApproved) {
    //     const tokenTx = await pokeBallContract.approve(pokeLockedStakingContract.address, totalprice, {from: account});
    //     const receipt = await tokenTx.wait();
    //     if (receipt.status) {
    //       toastSuccess(t('Successfully approved!'))
    //       setIsApproved(true);
    //     }
    //   } else {
    //     const tx = await pokeLockedStakingContract.stake(totalprice, DAYs[index].toString(), {from: account})
    //     // const tx = await onClaim()
    //     const receipt = await tx.wait()
    //     // global.console.log(receipt, receipt.status)
    //     if (receipt.status) {
    //       toastSuccess(t('Successfully claimed!'))
    //     }
    //   }
    // } catch (error) {
    //   toastError(t('Error'), t(`Please try again. ${  error.data?.message }`))
    // }
    setIsConfirming(false)
  }

  const handleAmountChanged = (val) => {
    global.console.log("Changed value", val);
    setAmount(val);
  }

  const handleMaxBtnClicked = async () => {
    if(!pokeBallContract) return;

    // const tokenBal = await pokeBallContract.balanceOf(account);
    global.console.log("tokenBal")
    // const tokenBala = fromWei(tokenBal.toString());

    // setAmount(tokenBala);
  }
  
  // Get Balance
  useEffect(() => {
    let chk = true;
    const getUserInfo = async () => {
      if(pokeBallContract === null) return;
      try {
        // const tokenBal = await pokeBallContract.balanceOf(account);
        // const tokenBala = fromWei(tokenBal.toString());
        global.console.log("tokenBal")
  
        // if(chk)
        //   setAccountBalance(tokenBala);

      } catch (error) {
        global.console.log("Loading")
      }
    }

    getUserInfo();
    return () => {
      chk = false;
    }
  }, [pokeBallContract, account])

  // Get Staking Info
  useEffect(() => {
    let chk = true;
    const getStakeInfo = async () => {
      if(pokeLockedStakingContract === null) return;
      try {
        const myStake = await pokeLockedStakingContract.stakes(account);
        // const tokenBala = fromWei(tokenBal.toString());
        

        if(chk)
          setStakeInfo({
            reward: fromWei(myStake.reward.toString()),
            yourstake: fromWei(myStake.initial.toString()),
            stakeDate: myStake.startday.toString(),
            redemptionDate: myStake.payday.toString()
          })

      } catch (error) {
        global.console.log("Loading")
      }
    }

    getStakeInfo();
    return () => {
      chk = false;
    }
  }, [pokeLockedStakingContract, account])

  // Update UI
  useEffect(() => {
    let chk = true;
    const updateUI = () => {
      if(index === null) return;
      const multiplier = (amount === null || amount === '') ? 0: parseFloat(amount);
      global.console.log(multiplier, ROIs[index])
      if(chk) {
        setIsApproved(false);
        setReward(ROIs[index] * multiplier / 100);
      }
    }

    updateUI();

    return () => {
      chk = false;
    }
  }, [amount, index])

  return (
    <StyledCard>
      <CardHeader p="16px 24px">
        <Flex justifyContent="space-between">
          <Heading mr="12px">{t('My Locked Staking')}</Heading>
        </Flex>
      </CardHeader>
      <CardBody>
        <Flex justifyContent='center' alignContent='center' mb='30px'>
          {/* <Row> */}
            <ButtonMenu activeIndex={index} onItemClick={handleClick}>
              <MenuButton>7<HiddenDiv>days</HiddenDiv></MenuButton>
              <MenuButton>14<HiddenDiv>days</HiddenDiv></MenuButton>
              <MenuButton>30<HiddenDiv>days</HiddenDiv></MenuButton>
              <MenuButton>90<HiddenDiv>days</HiddenDiv></MenuButton>
              <MenuButton>180<HiddenDiv>days</HiddenDiv></MenuButton>
              <MenuButton>365<HiddenDiv>days</HiddenDiv></MenuButton>
            </ButtonMenu>
          {/* </Row> */}
        </Flex>
        <RowBetween m='25px 0px'>
          <Heading scale="lg" ml='20px' color="primary" textAlign={['center', null, null, 'left']}>{t('Locked Amount')}</Heading>
        </RowBetween>
        <Row ml='20px' >
          <AmountField inputAmount={amount} amountHandle={handleAmountChanged} maxBtnHandle={ handleMaxBtnClicked} />
        </Row>
        <Row ml='20px' >
          <Text color="secondary" bold> { `Your balance: ${accountBalance} BALL` } </Text>
        </Row>
        <Row ml='20px' >
          <Text color="primary"> { parseFloat(accountBalance) < parseFloat(amount) ? 'Insufficient value' : ''} </Text>
        </Row>


        <RowBetween m='25px 0px'>
          <Heading scale="lg" ml='20px' color="primary" textAlign={['center', null, null, 'left']}>{t('Summary')}</Heading>
        </RowBetween>
        <RowBetween m='15px 0px'>
          <Heading ml='20px'>Stake Date</Heading>
          <Heading scale="md" mr='20px' color="secondary" textAlign={['center', null, null, 'left']}>{ startDate }</Heading>
        </RowBetween>
        <RowBetween m='15px 0px'>
          <Heading ml='20px'>Redemption Date</Heading>
          <Heading scale="md" color="secondary" textAlign={['center', null, null, 'left']} mr='20px'>{ lastDate }</Heading>
        </RowBetween>
        <RowBetween m='15px 0px'>
          <Heading ml='20px'>ROI</Heading>
          <Heading scale="md" color="secondary" textAlign={['center', null, null, 'left']} mr='20px'>{ index === null ? '0' : `${ ROIs[index] }`}%</Heading>
        </RowBetween>
        <RowBetween m='15px 0px'>
          <Heading ml='20px'>Total Reward</Heading>
          <Heading scale="md" color="secondary" textAlign={['center', null, null, 'left']} mr='20px'> { reward.toFixed(2) } BALL</Heading>
        </RowBetween>


        <RowBetween m='25px 0px'>
          <Heading scale="lg" ml='20px' color="primary" textAlign={['center', null, null, 'left']}>{t('One Stake per Account')}</Heading>
        </RowBetween>
        <RowBetween m='25px 0px'>
          <Heading ml='20px'>{t('The longer you stake the higher the ROI, however you wont be able to withdraw funds until the duration has passed.')}</Heading>
        </RowBetween>
        <Row>
          <Button 
            width="100%" 
            onClick={ handleStakingApprove } 
            isLoading={isConfirming}
            disabled={ !account || stakeInfo.redemptionDate !== "0" }
          > 
            { isApproved ? 'Confirm Staking' : 'Approve Staking' }
          </Button>
        </Row>

      </CardBody>
      <CardFooter p="0">
        {isExpanded && (
          <NextDrawWrapper>
            <RewardBrackets stakeData={stakeInfo} handleClaim={ claim }/>
          </NextDrawWrapper>
        )}
        {(status === LotteryStatus.OPEN || status === LotteryStatus.CLOSE) && (
          <Flex p="8px 24px" alignItems="center" justifyContent="center">
            <ExpandableLabel expanded={isExpanded} onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? t('Hide') : t('View My Locked Staking')}
            </ExpandableLabel>
          </Flex>
        )}
      </CardFooter>
    </StyledCard>
  )
}

export default NextDrawCard
