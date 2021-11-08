import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { ethers } from 'ethers'
import { useWeb3React } from '@web3-react/core'
import { Button, InjectedModalProps, Modal, Text, Flex, AutoRenewIcon, Input } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import useToast from 'hooks/useToast'
import {
  toWei, fromWei
} from 'utils/pokeHelpers';

import { 
  usePokeBallContract,
  usePokeNFTContract,
  useLockedStakingContract
} from 'hooks/useContract';
import Container from 'components/Layout/Container'
import Row from 'components/Layout/Row'

const Admin: React.FC = () => {
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
      if(!isApproved) {
        const tokenTx = await pokeBallContract.approve(pokeNftContract.address, toWei((saleprice + 1).toString()), {from: account});
        const receipt = await tokenTx.wait();
        if (receipt.status) {
          toastSuccess(t('Successfully approved!'))
          setIsApproved(true);
        }
      } else {
        const tx = await pokeNftContract.multiMint(account, ballId, amount, toWei(saleprice.toString()), {from: account})
        // const tx = await onClaim()
        const receipt = await tx.wait()
        // global.console.log(receipt, receipt.status)
        if (receipt.status) {
          toastSuccess(t('Successfully claimed!'))
        }
      }
    } catch {
      toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
    }
    setIsConfirming(false)
  }


  useEffect(() => {
    let chk = true;
    const getPrice = async () => {
      const saleprice = parseInt(fromWei((await pokeNftContract.getBallInfo('1')).price.toString()));
      if(chk)
      setTotalPrice(saleprice)
    }

    getPrice();

    return () => {
      chk = false;
    }
  }, [pokeNftContract])

  return (
    <Container>
        <Flex>
            <Row>
                Admin
            </Row>
        </Flex>
    </Container>
  )
}

export default Admin
