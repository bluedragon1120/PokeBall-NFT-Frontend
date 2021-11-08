import BigNumber from 'bignumber.js/bignumber'
import { DEFAULT_TOKEN_DECIMAL } from 'config'

export const toWei = (bigNum) => {
    return (new BigNumber(bigNum)).times(DEFAULT_TOKEN_DECIMAL).toString();
}
  
export const fromWei = (bigNum) => {
    return (new BigNumber(bigNum).div(DEFAULT_TOKEN_DECIMAL)).toString();
}