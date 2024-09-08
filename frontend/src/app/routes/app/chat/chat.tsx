import { useEffect } from 'react';
import { Textbox } from '@/features/textbox/components/textbox';
import { useChat } from '@/hooks/use-chat';
import { useSearchParams } from 'react-router-dom';
import { ClipboardIcon, Flame, Lightbulb, Origami, Sparkle } from 'lucide-react';
import { PulseLoader } from 'react-spinners';
import useScrollToEnd from '@/hooks/use-scroll-to-end';
import { ConversationArea } from '@/features/conversation/components/conversation-area';
import Message from '@/features/message/components/message';
import { useModelStore } from '@/features/models/store/model-store';
import ConversationHistory from '@/features/conversation/components/conversation-history.tsx';
import { ConversationAreaHeader } from '@/features/conversation/components/conversation-area-header.tsx';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function ChatRoute() {
  const {
    uuid,
    message,
    isTyping,
    messages,
    setMessage,
    handleSubmit,
    createChat,
    getChatHistory,
  } = useChat();

  const [searchParams, setSearchParams] = useSearchParams();

  const searchParamString = searchParams.get('c');

  const ref = useScrollToEnd(messages);

  useEffect(() => {
    if (searchParamString) {
      getChatHistory(searchParamString);
    }
  }, [searchParamString, getChatHistory]);

  const { model } = useModelStore(state => ({
    model: state.model,
  }));

  return (
    <>
      <ConversationHistory
        createChat={createChat}
        getChatHistory={getChatHistory}
        uuid={uuid}
        updateURL={setSearchParams}
      />
      {/*<div className="-z-10 absolute blur-2xl w-screen h-screen bg-[radial-gradient(at_56%_42%,_hsla(240,100%,70%,0.2)_0px,_transparent_50%),_radial-gradient(at_62%_61%,_hsla(302,65%,63%,0.1)_0px,_transparent_50%)]"/>*/}
      <div className="transition w-full max-w-full flex flex-col">
        <ConversationAreaHeader />
        <div className="transition relative flex flex-col flex-auto z-10">
          {/* <div className="w-full h-full flex mt-24 flex-col items-center justify-center">
            <div>
              <svg
                version="1.0"
                xmlns="http://www.w3.org/2000/svg"
                className="font-primary-foreground"
                fill="#ddd"
                width="60"
                viewBox="0 0 300.000000 282.000000"
                preserveAspectRatio="xMidYMid meet"
              >
                {' '}
                <g
                  transform="translate(0.000000,282.000000) scale(0.100000,-0.100000)"
                  stroke="none"
                >
                  {' '}
                  <path d="M1579 2810 c-10 -6 -115 -181 -235 -390 l-219 -380 -211 0 c-153 0 -214 -3 -226 -12 -9 -7 -160 -263 -336 -569 -349 -606 -352 -612 -352 -632 0 -17 216 -396 241 -421 18 -19 36 -20 456 -20 l437 -1 103 -180 c57 -99 110 -186 120 -192 13 -10 167 -13 689 -13 386 0 683 4 697 9 17 7 57 66 141 211 64 111 116 210 116 221 0 10 -97 187 -215 393 l-215 374 105 182 c58 100 105 193 105 206 0 30 -651 1169 -686 1202 -25 22 -30 22 -262 22 -133 0 -244 -5 -253 -10z m738 -635 l293 -510 -147 -3 c-80 -1 -150 1 -154 5 -4 5 -130 222 -279 483 -150 261 -281 490 -292 508 l-20 33 153 -3 153 -3 293 -510z m-408 -66 l293 -511 -173 -301 c-95 -166 -178 -310 -185 -320 -10 -16 -20 -3 -83 107 -39 70 -71 131 -71 137 0 7 45 91 101 188 56 97 101 186 101 198 0 22 -172 337 -219 401 l-24 32 -185 0 c-104 0 -184 4 -184 9 0 13 322 571 329 571 4 0 138 -230 300 -511z m-287 -257 c21 -37 54 -95 73 -129 l36 -63 -374 0 -375 0 -71 124 c-39 68 -71 126 -71 130 0 3 168 6 373 6 l372 0 37 -68z m-822 -127 l72 -125 -294 -509 c-216 -375 -296 -506 -304 -498 -16 18 -134 225 -134 236 0 10 580 1021 586 1021 1 0 35 -56 74 -125z m903 -217 c-11 -18 -45 -79 -77 -135 l-58 -103 -212 0 c-116 0 -216 -4 -223 -8 -20 -13 -243 -406 -243 -430 0 -12 38 -89 84 -170 l85 -147 -164 -3 c-90 -1 -240 -1 -334 0 l-171 3 296 513 296 512 370 0 370 0 -19 -32z m898 5 c-5 -10 -86 -151 -180 -313 l-170 -295 -151 -3 c-86 -1 -150 1 -148 6 1 5 82 147 178 315 l175 306 153 1 c142 0 152 -1 143 -17z m-919 -543 c54 -96 106 -181 115 -187 12 -10 81 -13 259 -13 216 0 244 2 262 18 12 9 57 79 100 155 l80 138 122 -213 c68 -117 142 -247 166 -288 l43 -75 -586 -3 c-323 -1 -590 1 -594 5 -8 8 -328 563 -355 616 l-15 28 152 -3 152 -3 99 -175z m-327 -207 c99 -174 179 -320 177 -325 -6 -22 -134 -238 -140 -238 -7 0 -357 603 -364 626 -3 11 132 254 142 254 3 -1 86 -143 185 -317z m1465 -398 c0 -3 -30 -57 -66 -120 l-67 -115 -593 0 -594 0 29 48 c16 26 47 80 70 120 l42 72 589 0 c325 0 590 -2 590 -5z" />{' '}
                </g>{' '}
              </svg>
            </div>
            <div className="w-full flex gap-6 items-center justify-center mt-16">
              <Card className="w-[200px] bg-secondary/50">
                <CardHeader>
                  <CardTitle className="flex gap-1 mb-2">
                    <ClipboardIcon className="size-4" /> Create project
                  </CardTitle>
                  <CardDescription>Generate structural code with one-click.</CardDescription>
                </CardHeader>
              </Card>
              <Card className="w-[200px] bg-secondary/50">
                <CardHeader>
                  <CardTitle className="flex gap-1 mb-2">
                    <Lightbulb className="size-4" /> Brainstorm Ideas
                  </CardTitle>
                  <CardDescription>Come up with novel and creative ideas.</CardDescription>
                </CardHeader>
              </Card>
              <Card className="w-[200px] bg-secondary/50">
                <CardHeader>
                  <CardTitle className="flex gap-1 mb-2">
                    <Sparkle className="size-4" /> Enhance Writing
                  </CardTitle>
                  <CardDescription>Get real time feedback and suggestions.</CardDescription>
                </CardHeader>
              </Card>
              <Card className="w-[200px] bg-secondary/50">
                <CardHeader>
                  <CardTitle className="flex gap-1 mb-2">
                    <Flame className="size-4" /> Pillow Talk
                  </CardTitle>
                  <CardDescription>Talk out your wildest dreams.</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div> */}

          <ConversationArea>
            <>
              {messages.length !== 0 &&
                messages.map((message, index) => (
                  <Message
                    key={`message-${message.id}-${index}`}
                    id={message?.id ?? ''}
                    isBot={message?.role !== 'user'}
                    isTyping={false}
                    message={message?.content}
                    time={message.created_at}
                    // username={message?.role === 'user' ? message?.role : message?.model}
                    username={message?.sender?.assistant?.name}
                  />
                ))}
                
              <div ref={ref} />
            </>
          </ConversationArea>
          
          <div className="mb-5 z-[99]">{console.log(messages)}
            <div className="-mb-3.5 mx-auto inset-x-0 bg-transparent flex justify-center">
              <div className="mx-auto flex flex-col max-w-4xl justify-center px-2.5 md:px-6 w-full">
                <div className="relative flex justify-center">
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center z-30 pointer-events-none">
                    {isTyping && (
                      <div className="mx-auto z-50 bg-primary/10 backdrop-blur p-2 rounded-lg left-0">
                        <div className="flex gap-2 items-center">
                          <Origami className="size-5" strokeWidth="1" /> {model?.model} is typing{' '}
                          <PulseLoader
                            size="3"
                            speedMultiplier={0.75}
                            color="#ffffff"
                            className="stroke-primary-foreground"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="w-full relative"></div>
            </div>
            <Textbox
              value={message}
              setValue={setMessage}
              onSubmit={handleSubmit}
              model={model?.name || ''}
            />
            <div className="text-xs gap-1 text-muted-foreground mt-1 pb-1 flex w-full text-center justify-center">
              CringeGPT <span className="italic">never</span> makes mistakes.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
