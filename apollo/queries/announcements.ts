import { gql } from '@apollo/client';

export const GET_ANNOUNCEMENTS = gql`
  query getAnnouncements($blockNumber: String!) {
    announcements(
      where: { block_number_gte: $blockNumber }
      orderBy: block_number
      orderDirection: desc
    ) {
      id
      schemeId
      stealthAddress
      ephemeralPubKey
      metadata
      block_number
      transactionHash_
      timestamp_
    }
  }
`