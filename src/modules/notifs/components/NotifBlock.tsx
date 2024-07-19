import { EmoteNotifSingleResponse, EmoteResponse, NOTIF_TYPE } from "actions/notifs/apiGetAllEmoteNotifs"
import A from "components/A"
import { useContext, useEffect, useRef, useState } from "react"
import { formatTimeAgo } from "utils/randomUtils"
import { EyeIcon, EyeOffIcon } from '@heroicons/react/outline'
import { DotsHorizontalIcon, ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/solid"
import { apiUpdateEmoteNotif } from "actions/notifs/apiUpdateEmoteNotif"
import { GlobalContext } from "lib/GlobalContext"
import ModalService from "components/modals/ModalService"
import SymbolSelectModal from "modules/symbol/components/SymbolSelectModal"
import toast from 'react-hot-toast'
import copy from 'copy-to-clipboard'
import { getFrontendURL } from "utils/seo-constants"
import ContextSelectModal from "modules/context/components/ContextSelectModal"
import EmoteSelectModal from "modules/emote/components/EmoteSelectModal"
import { PingpplFollowResponse } from "actions/pingppl/apiGetAllPingpplFollows"
import { PingpplSentEventResponse } from "actions/pingppl/apiGetAllSentEvents"
import PingpplFollowReactModal from "modules/contexts/pingppl/components/PingpplFollowReactModal"
import classNames from "classnames"
import PingpplSentEventReactModal from "modules/contexts/pingppl/components/PingpplSentEventReactModal"


export const NotifBlock = ({
  notif,
  jwt,
  isFullWidth = false,
}: {
  notif: EmoteNotifSingleResponse
  jwt: string
  isFullWidth?: boolean
}) => {
  const { setUserNotifData } = useContext(GlobalContext)
  const receiverSymbolsCount = (notif?.notifData as EmoteResponse)?.receiverSymbols?.length || 0
  const sentSymbolsCount = (notif?.notifData as EmoteResponse)?.sentSymbols?.length || 0
  const isMultipleReceivers = receiverSymbolsCount > 1
  const isMultipleSentSymbols = sentSymbolsCount > 1
  const [clientHasReadDirectly, setClientHasReadDirectly] = useState(notif?.hasReadDirectly)

  const [notifTooltipVisibility, setNotifTooltipVisibility] = useState(false)
  const notifRef = useRef(null)

  const [showDetails, setShowDetails] = useState(false)
  const [isFromDropdownOpen, setIsFromDropdownOpen] = useState(false)
  const [isToDropdownOpen, setIsToDropdownOpen] = useState(false)
  const [isSentSymbolsDropdownOpen, setIsSentSymbolsDropdownOpen] = useState(false)

  const [optionsTooltipVisibility, setOptionsTooltipVisibility] = useState(false)
  const optionsRef = useRef(null)

  const [sentSymbolsTooltipVisibility, setSentSymbolsTooltipVisibility] = useState(false)
  const sentSymbolsRef = useRef(null)

  const [receiversTooltipVisibility, setReceiversTooltipVisibility] = useState(false)
  const receiversRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifTooltipVisibility(false)
      } else {
        setNotifTooltipVisibility(true)
      }
    }
  
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setOptionsTooltipVisibility(false)
      } else {
        setOptionsTooltipVisibility(true)
      }
    }
  
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sentSymbolsRef.current && !sentSymbolsRef.current.contains(event.target)) {
        setSentSymbolsTooltipVisibility(false)
      } else {
        setSentSymbolsTooltipVisibility(true)
      }
    }
  
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (receiversRef.current && !receiversRef.current.contains(event.target)) {
        setReceiversTooltipVisibility(false)
      } else {
        setReceiversTooltipVisibility(true)
      }
    }
  
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const onMarkSeenChanged = async (isMarkSeen: boolean) => {
    let response = null
    if (isMarkSeen) {
      response = await apiUpdateEmoteNotif({ jwt, notifIDs: [notif.id], isCasualOrDirect: 'direct', isMarkingUnread: false })
    } else {
      response = await apiUpdateEmoteNotif({ jwt, notifIDs: [notif.id], isCasualOrDirect: 'direct', isMarkingUnread: true })
    }

    setUserNotifData(response)

    setClientHasReadDirectly(isMarkSeen)
  }

  const onShowDetailsChanged = (isDetailsShown: boolean) => {
    setShowDetails(isDetailsShown)
  }

  const copyEmotePageURL = (event) => {
    event?.stopPropagation()
    const url = `${getFrontendURL()}/emote/${notif?.notifData?.id}`
    copy(url)
    toast.success('Copied emote page URL')
  }

  if (notif?.notifType === NOTIF_TYPE.EMOTE) {
    return (
      <div
        onClick={(event) => ModalService.open(EmoteSelectModal, { emote: notif?.notifData })}
        className={classNames(
          isFullWidth ? 'w-full' : 'md:w-1/2 w-full ',
          "relative text-lg p-4 border border-white hover:bg-gray-100 hover:bg-opacity-[.1] flex items-center cursor-pointer",
        )}
      >
  
        {showDetails ? (
          <div className="">
  
            <div className="flex items-center">
  
              <div ref={notifRef} onClick={(event) => event.stopPropagation()} className="relative w-10 h-10 rounded-full p-1 hover:bg-gray-200 hover:bg-opacity-50 inline-flex justify-center items-center cursor-pointer">
                {clientHasReadDirectly ? (
                  <EyeIcon className="w-6 h-6 inline text-green-500" />
                ) : (
                  <EyeOffIcon className="w-6 h-6 inline text-red-500" />
                )}
  
                {notifTooltipVisibility && (
                  <div
                    onClick={(event) => {
                      event.stopPropagation()
                      setNotifTooltipVisibility(false)
                    }}
                    className="absolute z-[600] h-[6rem] w-[10rem] inset-y-0 left-0 top-full text-sm text-black rounded-xl shadow bg-white overflow-auto"
                  >
                    <div className="flex flex-col w-full text-black font-semibold">
                      <div onClick={(event) => {
                        event.stopPropagation()
                        onMarkSeenChanged(true)
                      }} className="px-2 py-2 border-b flex items-center cursor-pointer hover:bg-gray-200 hover:bg-opacity-50">
                        <EyeIcon className="w-4 h-4 mr-1 inline text-green-500" />
                        <span>Mark seen</span>
                      </div>
                      <div onClick={(event) => {
                        event.stopPropagation()
                        onMarkSeenChanged(false)
                      }} className="px-2 py-2 flex items-center cursor-pointer hover:bg-gray-200 hover:bg-opacity-50">
                        <EyeOffIcon className="w-4 h-4 mr-1 inline text-red-500" />
                        <span>Mark unseen</span>
                      </div>
                    </div>
                  </div>
                )}
  
              </div>
  
              <div>
                <A
                  onClick={(event) => {
                    event.stopPropagation()
                    ModalService.open(SymbolSelectModal, { symbol: (notif?.notifData as EmoteResponse)?.senderTwitterUsername })
                  }}
                  className="text-blue-500 hover:text-blue-700 cursor-pointer"
                >
                  {(notif?.notifData as EmoteResponse)?.senderTwitterUsername}
                </A> sent{' '}
  
                {isMultipleSentSymbols ? (
  
                  <span
                    ref={sentSymbolsRef}
                    onClick={(event) => event.stopPropagation()}
                    className="relative rounded-full inline-flex justify-center items-center cursor-pointer"
                  >
                    <span className="text-red-500 hover:text-red-700 cursor-pointer">{sentSymbolsCount} symbols</span>
  
                    {sentSymbolsTooltipVisibility && (
                      <div
                        onClick={(event) => {
                          event.stopPropagation()
                          setSentSymbolsTooltipVisibility(false)
                        }}
                        className="absolute z-[600] h-[6rem] w-[10rem] inset-y-0 right-0 top-full text-sm text-black rounded-xl shadow bg-white overflow-auto"
                      >
                        <div className="flex flex-col w-full text-black font-semibold">
                          <div onClick={(event) => {
                            event.stopPropagation()
                            onShowDetailsChanged(!showDetails)
                          }} className="px-2 py-2 border-b flex items-center cursor-pointer hover:bg-gray-200 hover:bg-opacity-50">
                            <span>toggle details</span>
                          </div>
  
                        </div>
                      </div>
                    )}
  
                  </span>
                ): (
                  <A
                    onClick={(event) => {
                      event.stopPropagation()
                      ModalService.open(SymbolSelectModal, { symbol: (notif?.notifData as EmoteResponse)?.sentSymbols[0] })
                    }}
                    className="text-red-500 hover:text-red-700 cursor-pointer"
                  >
                    {(notif?.notifData as EmoteResponse)?.sentSymbols[0]}
                  </A>
                )} to{' '}
  
                {isMultipleReceivers ? (
                  <span
                    ref={receiversRef}
                    onClick={(event) => event.stopPropagation()}
                    className="relative rounded-full inline-flex justify-center items-center cursor-pointer"
                  >
                    <span className="text-blue-500 hover:text-blue-700 cursor-pointer">you and {receiverSymbolsCount - 1} others</span>
  
                    {receiversTooltipVisibility && (
                      <div
                        onClick={(event) => {
                          event.stopPropagation()
                          setReceiversTooltipVisibility(false)
                        }}
                        className="absolute z-[600] h-[6rem] w-[10rem] inset-y-0 right-0 top-full text-sm text-black rounded-xl shadow bg-white overflow-auto"
                      >
                        <div className="flex flex-col w-full text-black font-semibold">
                          <div onClick={(event) => {
                            event.stopPropagation()
                            onShowDetailsChanged(!showDetails)
                          }} className="px-2 py-2 border-b flex items-center cursor-pointer hover:bg-gray-200 hover:bg-opacity-50">
                            <span>toggle details</span>
                          </div>
  
                        </div>
                      </div>
                    )}
  
                  </span>
                ): (
                  <A
                    onClick={(event) => {
                      event.stopPropagation()
                      ModalService.open(SymbolSelectModal, { symbol: (notif?.notifData as EmoteResponse)?.receiverSymbols[0] })
                    }}
                    className="text-blue-500 hover:text-blue-700 cursor-pointer"
                  >
                    you
                  </A>
                )} - {formatTimeAgo((notif as any)?.createdAt)}
  
                {' '}with{' '}
                <A
                  onClick={(event) => {
                    event.stopPropagation()
                    ModalService.open(ContextSelectModal, { context: (notif)?.context ?? 'no context' })
                  }}
                  className="text-purple-500 hover:text-purple-700 cursor-pointer"
                >
                  {(notif)?.context ?? 'no context'}
                </A>
  
              </div>
  
            </div>
  
            <div className="mt-3">
  
              <button onClick={(event) => {
                event.stopPropagation()
                setIsFromDropdownOpen(!isFromDropdownOpen)
              }} className="flex items-center py-2 px-4 rounded-md bg-[#374151] border border-[#374151] hover:border-white w-full">
                <div>FROM:</div>
                {isFromDropdownOpen ? (
                  <ChevronUpIcon className="w-5 h-5 ml-2" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 ml-2" />
                )}
              </button>
  
              {isFromDropdownOpen && (
                <ul className="ml-10 list-disc">
                  <li><A href={`/u/${(notif?.notifData as EmoteResponse)?.senderTwitterUsername}`} onClick={(event) => event.stopPropagation()} className="text-blue-500 hover:text-blue-700 cursor-pointer">
                    {(notif?.notifData as EmoteResponse)?.senderTwitterUsername}
                  </A></li>
                </ul>
              )}
  
            </div>
  
            <div className="mt-3">
  
              <button onClick={(event) => {
                event.stopPropagation()
                setIsToDropdownOpen(!isToDropdownOpen)
              }} className="flex items-center py-2 px-4 rounded-md bg-[#374151] border border-[#374151] hover:border-white w-full">
                <div>TO:</div>
                {isToDropdownOpen ? (
                  <ChevronUpIcon className="w-5 h-5 ml-2" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 ml-2" />
                )}
              </button>
  
              {isToDropdownOpen && (
                <ul className="ml-10 list-disc">
                  {(notif?.notifData as EmoteResponse)?.receiverSymbols && (notif?.notifData as EmoteResponse)?.receiverSymbols.map((receiverSymbol) => {
  
                    return (
                      <li key={receiverSymbol}>
                        <A
                          onClick={(event) => {
                            event.stopPropagation()
                            ModalService.open(SymbolSelectModal, { symbol: receiverSymbol })
                          }}
                          className="text-blue-500 hover:text-blue-700 cursor-pointer"
                        >
                          {receiverSymbol}
                        </A>
                      </li>
                    )
                  })}
                </ul>
              )}
  
            </div>
  
            <div className="mt-3">
  
              <button onClick={(event) => {
                event.stopPropagation()
                setIsSentSymbolsDropdownOpen(!isSentSymbolsDropdownOpen)
              }} className="flex items-center py-2 px-4 rounded-md bg-[#374151] border border-[#374151] hover:border-white w-full">
                <div>SENT SYMBOLS:</div>
                {isSentSymbolsDropdownOpen ? (
                  <ChevronUpIcon className="w-5 h-5 ml-2" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 ml-2" />
                )}
              </button>
  
              {isSentSymbolsDropdownOpen && (
                <ul className="ml-10 list-disc">
                  {(notif?.notifData as EmoteResponse)?.sentSymbols && (notif?.notifData as EmoteResponse)?.sentSymbols.map((sentSymbol) => {
  
                    return (
                      <li key={sentSymbol}>
                        <A
                          onClick={(event) => {
                            event.stopPropagation()
                            ModalService.open(SymbolSelectModal, { symbol: sentSymbol })
                          }}
                          className="text-red-500 hover:text-red-700 cursor-pointer"
                        >
                          {sentSymbol}
                        </A>
                      </li>
                    )
                  })}
                </ul>
              )}
  
            </div>
  
          </div>
        ): (
          <div className="flex items-center">
  
            <div ref={notifRef} onClick={(event) => event.stopPropagation()} className="relative w-10 h-10 rounded-full p-1 hover:bg-gray-200 hover:bg-opacity-50 inline-flex justify-center items-center cursor-pointer">
              {clientHasReadDirectly ? (
                <EyeIcon className="w-6 h-6 inline text-green-500" />
              ) : (
                <EyeOffIcon className="w-6 h-6 inline text-red-500" />
              )}
  
              {notifTooltipVisibility && (
                <div
                  onClick={(event) => {
                    event.stopPropagation()
                    setNotifTooltipVisibility(false)
                  }}
                  className="absolute z-[600] h-[6rem] w-[10rem] inset-y-0 left-0 top-full text-sm text-black rounded-xl shadow bg-white overflow-auto"
                >
                  <div className="flex flex-col w-full text-black font-semibold">
                    <div onClick={(event) => {
                      event.stopPropagation()
                      onMarkSeenChanged(true)
                      }} className="px-2 py-2 border-b flex items-center cursor-pointer hover:bg-gray-200 hover:bg-opacity-50">
                      <EyeIcon className="w-4 h-4 mr-1 inline text-green-500" />
                      <span>Mark seen</span>
                    </div>
                    <div onClick={(event) => {
                      event.stopPropagation()
                      onMarkSeenChanged(false)}} className="px-2 py-2 flex items-center cursor-pointer hover:bg-gray-200 hover:bg-opacity-50">
                      <EyeOffIcon className="w-4 h-4 mr-1 inline text-red-500" />
                      <span>Mark unseen</span>
                    </div>
                  </div>
                </div>
              )}
  
            </div>
  
            <div>
              <A
                onClick={(event) => {
                  event.stopPropagation()
                  ModalService.open(SymbolSelectModal, { symbol: (notif?.notifData as EmoteResponse)?.senderTwitterUsername })
                }}
                className="text-blue-500 hover:text-blue-700 cursor-pointer"
              >
                {(notif?.notifData as EmoteResponse)?.senderTwitterUsername}
              </A> sent{' '}
  
              {isMultipleSentSymbols ? (
  
                <span
                  ref={sentSymbolsRef}
                  onClick={(event) => event.stopPropagation()}
                  className="relative rounded-full inline-flex justify-center items-center cursor-pointer"
                >
                  <span className="text-red-500 hover:text-red-700 cursor-pointer">{sentSymbolsCount} symbols</span>
  
                  {sentSymbolsTooltipVisibility && (
                    <div
                      onClick={(event) => {
                        event.stopPropagation()
                        setSentSymbolsTooltipVisibility(false)
                      }}
                      className="absolute z-[600] h-[6rem] w-[10rem] inset-y-0 right-0 top-full text-sm text-black rounded-xl shadow bg-white overflow-auto"
                    >
                      <div className="flex flex-col w-full text-black font-semibold">
                        <div onClick={(event) => {
                          event.stopPropagation()
                          onShowDetailsChanged(!showDetails)
                        }} className="px-2 py-2 border-b flex items-center cursor-pointer hover:bg-gray-200 hover:bg-opacity-50">
                          <span>toggle details</span>
                        </div>
  
                      </div>
                    </div>
                  )}
  
                </span>
              ): (
                <A
                  onClick={(event) => {
                    event.stopPropagation()
                    ModalService.open(SymbolSelectModal, { symbol: (notif?.notifData as EmoteResponse)?.sentSymbols[0] })
                  }}
                  className="text-red-500 hover:text-red-700 cursor-pointer"
                >
                  {(notif?.notifData as EmoteResponse)?.sentSymbols[0]}
                </A>
              )} to{' '}
  
              {isMultipleReceivers ? (
                <span
                  ref={receiversRef}
                  onClick={(event) => event.stopPropagation()}
                  className="relative rounded-full inline-flex justify-center items-center cursor-pointer"
                >
                  <span className="text-blue-500 hover:text-blue-700 cursor-pointer">you and {receiverSymbolsCount - 1} others</span>
  
                  {receiversTooltipVisibility && (
                    <div
                      onClick={(event) => {
                        event.stopPropagation()
                        setReceiversTooltipVisibility(false)
                      }}
                      className="absolute z-[600] h-[6rem] w-[10rem] inset-y-0 right-0 top-full text-sm text-black rounded-xl shadow bg-white overflow-auto"
                    >
                      <div className="flex flex-col w-full text-black font-semibold">
                        <div onClick={(event) => {
                          event.stopPropagation()
                          onShowDetailsChanged(!showDetails)
                        }} className="px-2 py-2 border-b flex items-center cursor-pointer hover:bg-gray-200 hover:bg-opacity-50">
                          <span>toggle details</span>
                        </div>
  
                      </div>
                    </div>
                  )}
  
                </span>
              ): (
                <A
                  onClick={(event) => {
                    event.stopPropagation()
                    ModalService.open(SymbolSelectModal, { symbol: (notif?.notifData as EmoteResponse)?.receiverSymbols[0] })
                  }}
                  className="text-blue-500 hover:text-blue-700 cursor-pointer"
                >
                  you
                </A>
              )} - {formatTimeAgo((notif as any)?.createdAt)}
  
              {' '}with{' '}
              <A
                onClick={(event) => {
                  event.stopPropagation()
                  ModalService.open(ContextSelectModal, { context: (notif)?.context ?? 'no context' })
                }}
                className="text-purple-500 hover:text-purple-700 cursor-pointer"
              >
                {(notif)?.context ?? 'no context'}
              </A>
  
            </div>
  
          </div>
        )}
  
  
        <div
          ref={optionsRef}
          onClick={(event) => event.stopPropagation()}
          className="absolute right-0 top-0 z-[600] w-10 h-10 ml-2 rounded-full p-1 hover:bg-gray-200 hover:bg-opacity-50 inline-flex justify-center items-center cursor-pointer"
        >
          <DotsHorizontalIcon className="w-5 h-5 inline text-white" />
  
          {optionsTooltipVisibility && (
            <div
              onClick={(event) => {
                event.stopPropagation()
                setOptionsTooltipVisibility(false)
              }}
              className="absolute h-[6rem] w-[10rem] inset-y-0 right-0 top-full text-sm text-black rounded-xl shadow bg-white overflow-auto z-[600]"
            >
              <div className="flex flex-col w-full text-black font-semibold">
  
                <div onClick={(event) => {
                  event.stopPropagation()
                  onShowDetailsChanged(!showDetails)
                }} className="px-2 py-2 border-b flex items-center cursor-pointer hover:bg-gray-200 hover:bg-opacity-50">
                  <span>toggle details</span>
                </div>
  
                <div onClick={(event) => copyEmotePageURL(event)} className="px-2 py-2 border-b flex items-center cursor-pointer hover:bg-gray-200 hover:bg-opacity-50">
                  <span>copy link</span>
                </div>
  
                {/* <div onClick={() => onMarkSeenChanged(false)} className="px-2 py-2 flex items-center cursor-pointer hover:bg-gray-200 hover:bg-opacity-50">
                  <EyeOffIcon className="w-4 h-4 mr-1 inline text-red-500" />
                  <span>Mark unseen</span>
                </div> */}
  
              </div>
            </div>
          )}
  
        </div>
  
      </div>
    )
  }

  if (notif?.notifType === NOTIF_TYPE.PINGPPL_FOLLOW) {
    return (
      <div
        onClick={(event) => ModalService.open(PingpplFollowReactModal, { notif })}
        className={classNames(
          isFullWidth ? 'w-full' : 'md:w-1/2 w-full ',
          "relative text-lg p-4 border border-white hover:bg-gray-100 hover:bg-opacity-[.1] flex items-center cursor-pointer",
        )}
      >
        <div className="flex items-center">
  
          <div ref={notifRef} onClick={(event) => event.stopPropagation()} className="relative w-10 h-10 rounded-full p-1 hover:bg-gray-200 hover:bg-opacity-50 inline-flex justify-center items-center cursor-pointer">
            {clientHasReadDirectly ? (
              <EyeIcon className="w-6 h-6 inline text-green-500" />
            ) : (
              <EyeOffIcon className="w-6 h-6 inline text-red-500" />
            )}

            {notifTooltipVisibility && (
              <div
                onClick={(event) => {
                  event.stopPropagation()
                  setNotifTooltipVisibility(false)
                }}
                className="absolute z-[600] h-[6rem] w-[10rem] inset-y-0 left-0 top-full text-sm text-black rounded-xl shadow bg-white overflow-auto"
              >
                <div className="flex flex-col w-full text-black font-semibold">
                  <div onClick={(event) => {
                    event.stopPropagation()
                    onMarkSeenChanged(true)
                  }} className="px-2 py-2 border-b flex items-center cursor-pointer hover:bg-gray-200 hover:bg-opacity-50">
                    <EyeIcon className="w-4 h-4 mr-1 inline text-green-500" />
                    <span>Mark seen</span>
                  </div>
                  <div onClick={(event) => {
                    event.stopPropagation()
                    onMarkSeenChanged(false)
                  }} className="px-2 py-2 flex items-center cursor-pointer hover:bg-gray-200 hover:bg-opacity-50">
                    <EyeOffIcon className="w-4 h-4 mr-1 inline text-red-500" />
                    <span>Mark unseen</span>
                  </div>
                </div>
              </div>
            )}

          </div>

          <div>
            <A
              onClick={(event) => {
                event.stopPropagation()
                ModalService.open(SymbolSelectModal, { symbol: (notif?.notifData as PingpplFollowResponse)?.followSender })
              }}
              className="text-blue-500 hover:text-blue-700 cursor-pointer"
            >
              {(notif?.notifData as PingpplFollowResponse)?.followSender}
            </A>{' '}
            followed your planned ping:{' '}
            <A
              onClick={(event) => {
                event.stopPropagation()
                ModalService.open(PingpplFollowReactModal, { notif })
              }}
              className="text-red-500 hover:text-red-700 cursor-pointer"
            >
              {(notif?.notifData as PingpplFollowResponse)?.eventNameFollowed}
            </A> - {formatTimeAgo((notif as any)?.createdAt)}
            {' '}with{' '}
            <A
              onClick={(event) => {
                event.stopPropagation()
                ModalService.open(ContextSelectModal, { context: (notif)?.context ?? 'no context' })
              }}
              className="text-purple-500 hover:text-purple-700 cursor-pointer"
            >
              {(notif)?.context ?? 'no context'}
            </A>
          </div>
        
        </div>
      </div>
    )
  }

  if (notif?.notifType === NOTIF_TYPE.PINGPPL_SENTEVENT) {
    return (
      <div
        onClick={(event) => ModalService.open(PingpplSentEventReactModal, { notif })}
        className={classNames(
          isFullWidth ? 'w-full' : 'md:w-1/2 w-full ',
          "relative text-lg p-4 border border-white hover:bg-gray-100 hover:bg-opacity-[.1] flex items-center cursor-pointer",
        )}
      >
        <div className="flex items-center">
  
          <div ref={notifRef} onClick={(event) => event.stopPropagation()} className="relative w-10 h-10 rounded-full p-1 hover:bg-gray-200 hover:bg-opacity-50 inline-flex justify-center items-center cursor-pointer">
            {clientHasReadDirectly ? (
              <EyeIcon className="w-6 h-6 inline text-green-500" />
            ) : (
              <EyeOffIcon className="w-6 h-6 inline text-red-500" />
            )}

            {notifTooltipVisibility && (
              <div
                onClick={(event) => {
                  event.stopPropagation()
                  setNotifTooltipVisibility(false)
                }}
                className="absolute z-[600] h-[6rem] w-[10rem] inset-y-0 left-0 top-full text-sm text-black rounded-xl shadow bg-white overflow-auto"
              >
                <div className="flex flex-col w-full text-black font-semibold">
                  <div onClick={(event) => {
                    event.stopPropagation()
                    onMarkSeenChanged(true)
                  }} className="px-2 py-2 border-b flex items-center cursor-pointer hover:bg-gray-200 hover:bg-opacity-50">
                    <EyeIcon className="w-4 h-4 mr-1 inline text-green-500" />
                    <span>Mark seen</span>
                  </div>
                  <div onClick={(event) => {
                    event.stopPropagation()
                    onMarkSeenChanged(false)
                  }} className="px-2 py-2 flex items-center cursor-pointer hover:bg-gray-200 hover:bg-opacity-50">
                    <EyeOffIcon className="w-4 h-4 mr-1 inline text-red-500" />
                    <span>Mark unseen</span>
                  </div>
                </div>
              </div>
            )}

          </div>

          <div>
            <A
              onClick={(event) => {
                event.stopPropagation()
                ModalService.open(SymbolSelectModal, { symbol: (notif?.notifData as PingpplSentEventResponse)?.eventSender })
              }}
              className="text-blue-500 hover:text-blue-700 cursor-pointer"
            >
              {(notif?.notifData as PingpplSentEventResponse)?.eventSender}
            </A>{' '}
            pinged:{' '}
            <A
              onClick={(event) => {
                event.stopPropagation()
                ModalService.open(PingpplSentEventReactModal, { notif })
              }}
              className="text-red-500 hover:text-red-700 cursor-pointer"
            >
              {(notif?.notifData as PingpplSentEventResponse)?.eventName}
            </A> - {formatTimeAgo((notif as any)?.createdAt)}
            {' '}with{' '}
            <A
              onClick={(event) => {
                event.stopPropagation()
                ModalService.open(ContextSelectModal, { context: (notif)?.context ?? 'no context' })
              }}
              className="text-purple-500 hover:text-purple-700 cursor-pointer"
            >
              {(notif)?.context ?? 'no context'}
            </A>
          </div>
        
        </div>
      </div>
    )
  }

  return <div>...wat kinda notif is dis?</div>
}
