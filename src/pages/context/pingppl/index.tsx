import DefaultLayout from 'components/layouts/DefaultLayout'
import toast from 'react-hot-toast'
import { flatten } from 'lodash'
import { useContext, useState } from 'react'
import { useInfiniteQuery, useQueryClient } from 'react-query'
import { GlobalContext } from 'lib/GlobalContext'
import { twitterLogin } from 'modules/users/services/UserService'
import classNames from 'classnames'
import apiGetAllDefinedEvents from 'actions/pingppl/apiGetAllDefinedEvents'
import { apiCreateSentEvent } from 'actions/pingppl/apiCreateSentEvent'
import { apiCreateDefinedEvent } from 'actions/pingppl/apiCreateDefinedEvent'
import { apiCreateDefinedEventAndThenSentEvent } from 'actions/pingppl/apiCreateDefinedEventAndThenSentEvent'
import CircleSpinner from 'components/animations/CircleSpinner'
import apiGetAllSentEvents, { PingpplSentEventResponse } from 'actions/pingppl/apiGetAllSentEvents'
import { formatTimeAgo } from 'utils/randomUtils'
import A from 'components/A'
import apiGetAllEmoteNotifs, { NOTIF_TYPE } from 'actions/notifs/apiGetAllEmoteNotifs'

const PingPplPage = () => {
  const queryClient = useQueryClient()

  const { jwtToken, user } = useContext(GlobalContext)
  const [selectedTab, setSelectedTab] = useState('pingppl')
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [pingNow, setPingNow] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isPingOrPlanSending, setIsPingOrPlanSending] = useState(false)

  // const isValid = selectedSymbol?.length > 0

  const fetchDefinedEvents = async ({ pageParam = 0 }) => {
    const definedEvents = await apiGetAllDefinedEvents({ eventCreator: user?.twitterUsername, skip: pageParam, limit: 10, orderBy: 'createdAt', orderDirection: 'desc' })
    return definedEvents
  }

  const { data: infiniteDefinedEvents, fetchNextPage: fetchDENextPage, hasNextPage: hasDENextPage, isFetchingNextPage: isFetchingDENextPage } = useInfiniteQuery(
    [`infiniteDefinedEvents-${user?.twitterUsername}`],
    ({ pageParam = 0 }) =>
      fetchDefinedEvents({
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
      enabled: Boolean(jwtToken),
      keepPreviousData: true,
    }
  )

  const fetchSentEvents = async ({ pageParam = 0 }) => {
    const sentEvents = await apiGetAllSentEvents({ eventSender: user?.twitterUsername, skip: pageParam, limit: 10, orderBy: 'createdAt', orderDirection: 'desc' })
    return sentEvents
  }

  const { data: infiniteSentEvents, fetchNextPage: fetchSENextPage, hasNextPage: hasSENextPage, isFetchingNextPage: isFetchingSENextPage } = useInfiniteQuery(
    [`infiniteSentEvents-${user?.twitterUsername}`],
    ({ pageParam = 0 }) =>
      fetchSentEvents({
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
      enabled: Boolean(jwtToken),
      keepPreviousData: true,
    }
  )

  const fetchPingNotifs = async ({ pageParam = 0 }) => {
    const notifs = await apiGetAllEmoteNotifs({ notifType: NOTIF_TYPE.PINGPPL_SENTEVENT, jwt: jwtToken, skip: pageParam, limit: 10, orderBy: 'createdAt', orderDirection: 'desc' })
    return notifs ? notifs.emoteNotifs : []
  }

  const { data: infinitePingNotifs, fetchNextPage: fetchPNNextPage, hasNextPage: hasPNNextPage, isFetchingNextPage: isFetchingPNNextPage } = useInfiniteQuery(
    ['infinitePingNotifs'],
    ({ pageParam = 0 }) =>
      fetchPingNotifs({
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
      enabled: Boolean(jwtToken),
      keepPreviousData: true,
    }
  )

  async function pingpplClicked() {
    setIsPingOrPlanSending(true)

    const responseSentEvent = await apiCreateSentEvent({
      jwt: jwtToken,
      eventName: selectedEvent?.eventName,
      definedEventID: selectedEvent?.id,
    })
  
    if (responseSentEvent) {
      console.log('sent-event created successfully:', responseSentEvent)
      toast.success(`"${selectedEvent?.eventName}" has been pinged to ppl`)
    } else {
      console.error('Failed to create sent-event')
      toast.error(`"${selectedEvent?.eventName}" failed to ping`)
    }

    setIsPingOrPlanSending(false)

    // queryClient.invalidateQueries([`infiniteDefinedEvents-${user?.twitterUsername}`])
    queryClient.invalidateQueries([`infiniteSentEvents-${user?.twitterUsername}`])
    
  }

  async function planpingOrBothClicked(e) {
    e.preventDefault();
    setIsPingOrPlanSending(true)

    if (pingNow) {
      const responseBothEvent = await apiCreateDefinedEventAndThenSentEvent({
        jwt: jwtToken,
        eventName,
        eventDescription,
      })
    
      if (responseBothEvent) {
        console.log('defined-event and sent-event created successfully:', responseBothEvent)
        toast.success(`"${eventName}" has been planned and pinged to ppl`)
      } else {
        console.error('Failed to create defined-event and sent-event')
        toast.error(`"${eventName}" failed to be planned and pinged to ppl`)
      }
    } else {
      const responseDefinedEvent = await apiCreateDefinedEvent({
        jwt: jwtToken,
        eventName,
        eventDescription,
      })
    
      if (responseDefinedEvent) {
        console.log('defined-event created successfully:', responseDefinedEvent)
        toast.success(`"${eventName}" has been planned and shared`)
      } else {
        console.error('Failed to create defined-event')
        toast.error(`"${eventName}" failed to be planned and shared`)
      }
    }

    setIsPingOrPlanSending(false)

    queryClient.invalidateQueries([`infiniteDefinedEvents-${user?.twitterUsername}`])
    queryClient.invalidateQueries([`infiniteSentEvents-${user?.twitterUsername}`])
  }

  const definedEventsData = flatten(infiniteDefinedEvents?.pages || [])
  const sentEventsData = flatten(infiniteSentEvents?.pages || [])
  const notifsData = flatten(infinitePingNotifs?.pages || [])

  return (
    <div className="h-screen flex flex-col items-center mt-4">

      <>
      
        {!user?.twitterUsername ? (
          <>
            <div
              onClick={() => twitterLogin(null)}
              className="relative h-20 flex justify-center items-center px-4 py-2 ml-2 mb-8 text-xs font-bold text-white rounded-xl bg-[#1DA1F2] rounded-xl"
            >
              connect X
            </div>
          </>
        ): (
          <>

            <div className="w-full max-w-md mx-auto mt-4 p-4 bg-black text-black rounded-lg shadow-md">

              <div className="flex flex-wrap justify-center mt-6">
                <button
                  onClick={() => setSelectedTab('pingppl')}
                  className={classNames(
                    'p-3 mb-4 mr-2 text-white rounded-lg hover:bg-purple-600 border border-purple-600 cursor-pointer',
                    selectedTab === 'pingppl' ? 'bg-purple-500' : '',
                  )}
                >
                  pingppl
                </button>

                <button
                  onClick={() => setSelectedTab('plan-ping')}
                  className={classNames(
                    'p-3 mb-4 mr-2 text-white rounded-lg hover:bg-purple-600 border border-purple-600 cursor-pointer',
                    selectedTab === 'plan-ping' ? 'bg-purple-500' : '',
                  )}
                >
                  plan ping
                </button>

                <button
                  onClick={() => setSelectedTab('planned-pings')}
                  className={classNames(
                    'p-3 mb-4 mr-2 text-white rounded-lg hover:bg-purple-600 border border-purple-600 cursor-pointer',
                    selectedTab === 'planned-pings' ? 'bg-purple-500' : '',
                  )}
                >
                  ur planned pings
                </button>

                <button
                  onClick={() => setSelectedTab('sent-pings')}
                  className={classNames(
                    'p-3 mb-4 mr-2 text-white rounded-lg hover:bg-purple-600 border border-purple-600 cursor-pointer',
                    selectedTab === 'sent-pings' ? 'bg-purple-500' : '',
                  )}
                >
                  ur sent pings
                </button>

                <button
                  onClick={() => setSelectedTab('ping-notifications')}
                  className={classNames(
                    'p-3 mb-4 mr-2 text-white rounded-lg hover:bg-purple-600 border border-purple-600 cursor-pointer',
                    selectedTab === 'ping-notifications' ? 'bg-purple-500' : '',
                  )}
                >
                  ping notifications
                </button>
              </div>

              {selectedTab === 'pingppl' && (
                <div className="mt-4">
                  {/* <h2 className="text-xl font-semibold mb-4">send created event</h2> */}

                  <select
                    value={JSON.stringify(selectedEvent)}
                    onChange={(e) => {
                      if (!e.target.value) {
                        setSelectedEvent('')
                      } else {
                        const event = JSON.parse(e.target.value)
                        setSelectedEvent(event)
                      }
                    }}
                    className="w-full px-3 py-2 border rounded-md mb-4 bg-dark3 text-white"
                  >
                    <option value="">select planned ping</option>

                    {definedEventsData.map((event) => (
                      <option key={event.id} value={JSON.stringify(event)}>
                        {event.eventName}
                      </option>
                    ))}

                    {hasDENextPage && <button onClick={() => fetchDENextPage()} disabled={!hasDENextPage || isFetchingDENextPage}>
                      {isFetchingDENextPage ? 'Loading...' : 'Load More'}
                    </button>}

                  </select>

                  <button
                    onClick={pingpplClicked}
                    disabled={!selectedEvent}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded-md flex items-center justify-center disabled:opacity-50"
                  >
                    {/* <Send className="w-4 h-4 mr-2" /> */}
                    pingppl
                  </button>

                </div>
              )}

              {selectedTab === 'plan-ping' && (
                <form onSubmit={planpingOrBothClicked} className="space-y-4">
                  <div className="text-xs text-white">NOTE: planning a ping simply shares it to your profile, but does not ping anyone (unless you choose ping immediately)</div>
                  <input
                    type="text"
                    placeholder="ping name..."
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-md bg-dark3 text-white"
                  />
                  {/* <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  /> */}
                  <textarea
                    placeholder="ping description..."
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md bg-dark3 text-white"
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="pingNow"
                      checked={pingNow}
                      onChange={(e) => setPingNow(e.target.checked)}
                      className="rounded text-blue-500 "
                    />
                    <label htmlFor="pingNow" className="text-white">pingppl immediately</label>
                  </div>

                  <div className="flex space-x-2">
                    <button type="submit" className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md flex items-center justify-center">
                      {pingNow ? (
                        <>
                          {/* <PlusCircle className="w-4 h-4 mr-2" /> */}
                          share plan & pingppl
                        </>
                      ) : (
                        <>
                          {/* <Calendar className="w-4 h-4 mr-2" /> */}
                          share plan (no ping)
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {selectedTab === 'planned-pings' && (
                <div className="text-white">
                  {definedEventsData.map((event) => (
                    <div
                      key={event.id}
                      // onClick={(event) => ModalService.open(EmoteSelectModal, { emote: notif?.notifData })}
                      className="relative w-full text-lg p-4 border border-white hover:bg-gray-100 hover:bg-opacity-[.1] cursor-pointer"
                    >
                      <div className="font-bold">{event.eventName}</div>
                      <div className="text-xs">{event.eventDescription}</div>
                    </div>
                  ))}

                  {hasDENextPage && <button onClick={() => fetchDENextPage()} disabled={!hasDENextPage || isFetchingDENextPage}>
                    {isFetchingDENextPage ? 'Loading...' : 'Load More'}
                  </button>}
                </div>
              )}

              {selectedTab === 'sent-pings' && (
                <div className="text-white">
                  {sentEventsData.map((event) => (
                    <div
                      key={event.id}
                      // onClick={(event) => ModalService.open(EmoteSelectModal, { emote: notif?.notifData })}
                      className="relative w-full text-lg p-4 border border-white hover:bg-gray-100 hover:bg-opacity-[.1] cursor-pointer"
                    >
                      <div className="">you sent{' '}
                      <A
                        onClick={(e) => {
                          e.stopPropagation()
                          // ModalService.open(SymbolSelectModal, { symbol: event.eventName })
                        }}
                        className="text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        {event.eventName}
                      </A>{' '}
                      - {formatTimeAgo((event)?.createdAt)}</div>
                    </div>
                  ))}

                  {hasSENextPage && <button onClick={() => fetchSENextPage()} disabled={!hasSENextPage || isFetchingSENextPage}>
                    {isFetchingSENextPage ? 'Loading...' : 'Load More'}
                  </button>}
                </div>
              )}

              {selectedTab === 'ping-notifications' && (
                <div className="text-white">
                  {notifsData.map((notif) => (
                    <div
                      key={notif.id}
                      // onClick={(event) => ModalService.open(EmoteSelectModal, { emote: notif?.notifData })}
                      className="relative w-full text-lg p-4 border border-white hover:bg-gray-100 hover:bg-opacity-[.1] cursor-pointer"
                    >
                      <A
                        onClick={(event) => {
                          event.stopPropagation()
                          // ModalService.open(SymbolSelectModal, { symbol: (notif?.notifData as PingpplSentEventResponse)?.eventSender })
                        }}
                        className="text-blue-500 hover:text-blue-700 cursor-pointer"
                      >
                        {(notif?.notifData as PingpplSentEventResponse)?.eventSender}
                      </A>{' '}
                      pinged:{' '}
                      <A
                        onClick={(event) => {
                          event.stopPropagation()
                          // ModalService.open(SymbolSelectModal, { symbol: (notif?.notifData as PingpplSentEventResponse)?.eventName })
                        }}
                        className="text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        {(notif?.notifData as PingpplSentEventResponse)?.eventName}
                      </A> - {formatTimeAgo((notif?.notifData as any)?.createdAt)}
                    </div>
                  ))}

                  {hasPNNextPage && <button onClick={() => fetchPNNextPage()} disabled={!hasPNNextPage || isFetchingPNNextPage}>
                    {isFetchingPNNextPage ? 'Loading...' : 'Load More'}
                  </button>}
                </div>
              )}

              
              {isPingOrPlanSending && (
                <CircleSpinner color="white" bgcolor="#0857e0" />
              )}
              
            </div>
            
          </>
        )}

        
      </>

    </div>
  )
}

(PingPplPage as any).layoutProps = {
  Layout: DefaultLayout,
}

export default PingPplPage
