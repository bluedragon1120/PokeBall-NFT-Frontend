import React from 'react'
import { Flex, Text, Button } from '@pancakeswap/uikit'
import styled from 'styled-components'
import { useTranslation } from 'contexts/Localization'
import RewardBracketDetail from './RewardBracketDetail'


const Wrapper = styled(Flex)`
  width: 100%;
  flex-direction: column;
`

const RewardsInner = styled.div`
  display: grid;
  grid-template-columns: repeat(2, auto);
  row-gap: 16px;

  ${({ theme }) => theme.mediaQueries.sm} {
    grid-template-columns: repeat(4, 1fr);
  }
`
interface StakeData {
  reward: string
  yourstake: string
  stakeDate: string
  redemptionDate: string
}

interface RewardMatchesProps {
  stakeData: StakeData
  handleClaim: any
}

const RewardBrackets: React.FC<RewardMatchesProps> = ({ stakeData, handleClaim }) => {
  const { t } = useTranslation()
  
  const rewardBrackets = [0, 1, 2, 3]
  const heads = ['Reward', 'Your Stake', 'Stake Date', 'Redemption Date'];
  const values = [stakeData.reward, stakeData.yourstake, stakeData.stakeDate, stakeData.redemptionDate];
  const isBalances = [true, true, false, false];
  return (
    <Wrapper>
      <RewardsInner>
        {rewardBrackets.map((bracketIndex) => (
          <RewardBracketDetail
            key={bracketIndex}
            title={heads[bracketIndex]}
            value={values[bracketIndex]}
            isBalance={ isBalances[bracketIndex]}
          />
        ))}
      </RewardsInner>
      <br/>
      <Flex>
        {/* claim button */}
        <Button disabled={ stakeData.redemptionDate === "0" } maxWidth="200px" onClick={ handleClaim }>
          Claim
        </Button>
        <Text fontSize="14px" mt="12px" ml="12px">
          {t('You can only claim on redemption date.')}
        </Text>
      </Flex>

    </Wrapper>
  )
}

export default RewardBrackets
