import React, { useState, useEffect } from 'react'
// import BigNumber from 'bignumber.js'
// import { Flex, Text } from '@pancakeswap/uikit'
import styled from 'styled-components'
// import { BIG_ZERO } from 'utils/bigNumber'
// import { useTranslation } from 'contexts/Localization'
import { LotteryRound } from 'state/types'


// const Wrapper = styled(Flex)`
//   width: 100%;
//   flex-direction: column;
// `

const AmountInput = styled.input`
    width:94%;
    background: #fff;
    font: inherit;
    box-shadow: 0 6px 10px 0 rgba(0, 0, 0 , .1);
    border: 2px solid #ab3b3a;
    outline: 0;
    padding: 12px 18px;
`

AmountInput.defaultProps = {
    type: 'number'
};

const MaxButton = styled.button`
    display: inline-block;
    background: transparent;
    color: inherit;
    font: inherit;
    border: 0;
    outline: 0;
    padding: 0;
    transition: all 200ms ease-in;
    cursor: pointer;

    background: #ab3b3a;
    color: #fff;
    box-shadow: 0 0 10px 2px rgba(0, 0, 0, .1);
    border-radius: 2px;
    padding: 12px 36px;

    &:hover {
        background: darken(#ab3b3a, 4%);
    }
    
    &:active {
        background: #1FC7D4;
        box-shadow: inset 0 0 10px 2px rgba(0, 0, 0, .2);
    }

    margin-left: -110px;
`

interface AmountFieldProps {
  lotteryNodeData?: LotteryRound
  isHistoricRound?: boolean
  amountHandle: any
  maxBtnHandle: any
  inputAmount: any
}

const AmountField: React.FC<AmountFieldProps> = ({inputAmount, amountHandle, maxBtnHandle}) => {
  // const { t } = useTranslation()

  const handleChange = (e) => {
    amountHandle(e.target.value);
  }

  return (
    <>
        <AmountInput value={ inputAmount } onChange={handleChange}/>
        <MaxButton onClick={ maxBtnHandle }>Max</MaxButton>
        {/* <input type="email" class="form__field" placeholder="Your E-Mail Address" />
        <button type="button" class="btn btn--primary btn--inside uppercase">Send</button> */}
    </>
  );
}

export default AmountField
