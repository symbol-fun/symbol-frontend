import client from 'lib/axios'

/**
 * Get single definition from single user
 */
export default async function apiGetUserDefinition({
  jwt = null,
  twitterUsername = null,
  symbol = null,
}) {

  try {
    const response = await client.get(`/symbol-definition/single`, {
      params: {
        twitterUsername,
        symbol,
      },
      headers: {
        Authorization: jwt ? `Bearer ${jwt}` : null,
      },
    },)

    return response?.data?.data?.symbolDefinition
  } catch (error) {
    console.error('Could not get this particular definition', error)
    return []
  }
}
