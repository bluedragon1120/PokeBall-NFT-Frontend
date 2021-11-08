import React from 'react'
import { Flex, Text } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'

interface RewardBracketDetailProps {
  rewardBracket?: number
  isBalance: boolean
  title: string
  value: string
}

const RewardBracketDetail: React.FC<RewardBracketDetailProps> = ({
  title,
  value,
  isBalance
}) => {
  const { t } = useTranslation()

  return (
    <Flex flexDirection="column">
      <Text bold color='secondary'>
        {t(title)}
      </Text>
      <Text fontSize="20px" bold >
        { isBalance ? value : value}  { isBalance ? " BALL" : "" }
      </Text>
    </Flex>
  )
}

export default RewardBracketDetail
