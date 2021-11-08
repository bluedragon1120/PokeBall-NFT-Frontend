import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { ethers } from 'ethers'
import { useWeb3React } from '@web3-react/core'
import { Button, InjectedModalProps, Modal, Text, Flex, AutoRenewIcon, Input } from '@pancakeswap/uikit'
import { Nft } from 'config/constants/nfts/types'
import { useTranslation } from 'contexts/Localization'
import useToast from 'hooks/useToast'
import {
  toWei, fromWei
} from 'utils/pokeHelpers';

import { 
  usePokeBallContract,
  usePokeNFTContract
} from 'hooks/useContract';

interface ClaimNftModalProps extends InjectedModalProps {
  nft: Nft
  onSuccess: () => void
  onClaim: () => Promise<ethers.providers.TransactionResponse>
}

const ModalContent = styled.div`
  margin-bottom: 16px;
`

const Actions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 8px;
`

const ClaimNftModal: React.FC<ClaimNftModalProps> = ({ nft, onSuccess, onClaim, onDismiss }) => {
  const [isConfirming, setIsConfirming] = useState(false)
  const [amount, setAmount] = useState('1')
  const [totalPrice, setTotalPrice] = useState(0)
  const [isApproved, setIsApproved] = useState(false);

  const { t } = useTranslation()
  const { account } = useWeb3React()
  const { toastError, toastSuccess, toastWarning } = useToast()

  const pokeBallContract = usePokeBallContract();
  const pokeNftContract = usePokeNFTContract();
  
  const handleConfirm = async () => {
    if(!amount || amount === '' || !totalPrice) {
      toastWarning(t('Warning'), t('Amount cannot be zero.'));
      return;
    }

    if(!account || !pokeBallContract || !pokeNftContract) {
      toastError(t('Error'), t('Please check your connection.'));
      return;
    }

    setIsConfirming(true)
    try {
      const ballId = 1 // nft.id;
      // global.console.log(ballId, pokeNftContract);

      const saleprice = totalPrice * parseInt(amount);

      // global.console.log(pokeNftContract.address);
      // if(!isApproved) {
      //   const tokenTx = await pokeBallContract.approve(pokeNftContract.address, toWei((saleprice + 1).toString()), {from: account});
      //   const receipt = await tokenTx.wait();
      //   if (receipt.status) {
      //     toastSuccess(t('Successfully approved!'))
      //     // onDismiss()
      //     onSuccess()
      //     setIsApproved(true);
      //   }
      // } else {
      //   const tx = await pokeNftContract.multiMint(account, ballId, amount, toWei(saleprice.toString()), {from: account})
      //   // const tx = await onClaim()
      //   const receipt = await tx.wait()
      //   // global.console.log(receipt, receipt.status)
      //   if (receipt.status) {
      //     toastSuccess(t('Successfully claimed!'))
      //     onDismiss()
      //     onSuccess()
      //   }
      // }
    } catch {
      toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
    }
    setIsConfirming(false)
  }

  const handleValueChange = (e) => {
    const val = e.target.value;
    if(!val) setAmount('');
    const isnum = /^\d+$/.test(val);
    if(!isnum) return;
    setAmount(e.target?.value)
  }

  useEffect(() => {
    let chk = true;
    const getPrice = async () => {
      // const saleprice = parseInt(fromWei((await pokeNftContract.getBallInfo('1')).price.toString()));
      if(chk)
        global.console.log("test")
      // setTotalPrice(saleprice)
    }

    getPrice();

    return () => {
      chk = false;
    }
  }, [pokeNftContract])

  return (
    <Modal title={t('Purchase Collectible')} onDismiss={onDismiss}>
      <ModalContent>
        <Flex alignItems="center" mb="8px" justifyContent="space-between">
          <Text>{t('You will receive')}:</Text>
          <Text bold>{t(`${amount && amount !== '' ? amount: '0' }x %nftName% Collectible`, { nftName: nft.name })}</Text>
        </Flex>
        <Text bold mb="4px" color="secondary">{t(`${amount && totalPrice && amount !== '' ? (parseInt(amount) * totalPrice) : '0' }x BALL required`)}</Text>
        <Input type="text" value={amount} onChange={ handleValueChange }/>
      </ModalContent>
      <Actions>
        <Button width="100%" variant="secondary" onClick={onDismiss}>
          {t('Cancel')}
        </Button>
        <Button
          width="100%"
          onClick={handleConfirm}
          disabled={!account}
          isLoading={isConfirming}
          endIcon={isConfirming ? <AutoRenewIcon color="currentColor" spin /> : null}
        >
          {t(isApproved ? 'Confirm' : 'Approve')}
        </Button>
      </Actions>
    </Modal>
  )
}

export default ClaimNftModal
