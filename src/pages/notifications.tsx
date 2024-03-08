import DefaultLayout from 'components/layouts/DefaultLayout'
import { useInfiniteQuery } from 'react-query'
import { flatten } from 'lodash'
import { formatTimeAgo } from 'utils/randomUtils'
import A from 'components/A'
import apiGetAllEmoteNotifs from 'actions/notifs/apiGetAllEmoteNotifs'
import { useContext } from 'react'
import { GlobalContext } from './_app'
import { NotifBlock } from 'modules/notifs/components/NotifBlock'


const Notifications = () => {
  const { jwtToken } = useContext(GlobalContext)

  const fetchNotifs = async ({ pageParam = 0 }) => {
    const notifs = await apiGetAllEmoteNotifs({ jwt: jwtToken, skip: pageParam, limit: 10, orderBy: 'createdAt', orderDirection: 'desc' })
    return notifs ? notifs.emoteNotifs : []
  }

  const { data: infiniteNotifs, fetchNextPage: fetchNotifsNextPage, hasNextPage: hasNotifsNextPage, isFetchingNextPage: isNotifsFetchingNextPage } = useInfiniteQuery(
    ['notifs', 10, jwtToken],
    ({ pageParam = 0 }) =>
      fetchNotifs({
        pageParam
      }),
    {
      getNextPageParam: (lastGroup, allGroups) => {
        const morePagesExist = lastGroup?.length === 10

        if (!morePagesExist) {
          return false
        }

        return allGroups.length * 10
      },
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      enabled: true,
      keepPreviousData: true,
    }
  )

  const notifsData = flatten(infiniteNotifs?.pages || [])

  // console.log('notifsData==', notifsData)

  return (
    <div className="h-screen flex flex-col items-center mt-10">

      <h1 className="text-4xl font-bold mb-4">Notifications</h1>

      <>
        {notifsData?.map((notif) => {
          

          return (
            <NotifBlock notif={notif} jwt={jwtToken} key={notif?.emoteData.id} />
          )
        })}

        {hasNotifsNextPage && <button onClick={() => fetchNotifsNextPage()} disabled={!hasNotifsNextPage || isNotifsFetchingNextPage}>
          {isNotifsFetchingNextPage ? 'Loading...' : 'Load More'}
        </button>}
      </>

    </div>
  )
}

(Notifications as any).layoutProps = {
  Layout: DefaultLayout,
}

export default Notifications
