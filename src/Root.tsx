import NavBar from "./components/elements/navbar.tsx";
import { Button, IconButton, Text, Tooltip } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import SummarizeForm from "./forms/chat.tsx";
import Sidebar from "./components/elements/sidebar.tsx";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import postChat, { Chat } from "./api/postChat.ts";
import ResponseBox from "./components/responseBox.tsx";
import { HomeIcon, PlusIcon } from "@radix-ui/react-icons";

export default function Root() {
  const [response, setResponse] = useState([]);
  const queryClient = useQueryClient();
  const [parameters, setParameters] = useState({
    model: "cringe",
    temperature: undefined,
    top_k: undefined,
    top_p: undefined,
    system_prompt: undefined,
  });
  const mutation = useMutation({
    mutationFn: (formData: Chat) => {
      const history = response.flatMap(
        (message) => message.messages?.at(0) || message.message
      );
      formData.messages = [formData.messages[0], ...history];
      return postChat(formData);
    },
    mutationKey: ["chats"],
    onSuccess: (result) => {
      queryClient.setQueryData(["chats"], result);
      const newMessageHistory = [...response, result];
      setResponse(newMessageHistory);
    },
  });

  const handleMessageSend = (newMessage: Chat) => {
    if (newMessage?.messages) {
      mutation.mutate(newMessage);
    }
    const newMessageHistory = [...response, newMessage];
    setResponse(newMessageHistory);
  };

  useEffect(() => {
    console.log("RESPONSE CHANGED: ", response);
  }, [response]);

  return (
    <div className="grid h-screen w-full pl-[55px]">
      <aside className="inset-y fixed left-0 z-20 flex h-full flex-col border-r">
        <div className="pb-6 p-2">
          <Button variant="outline" size="2" aria-label="Home">
            <HomeIcon className="size-5 fill-foreground" />
          </Button>
        </div>
        <nav className="grid gap-5 p-2 justify-center">
          <Tooltip content="Dashboard">
            <Button variant="ghost" radius="large" className="h-24 w-8 m-auto">
              <MessageIcon />
            </Button>
          </Tooltip>
          <Tooltip content="settings">
            <IconButton radius="full">
              <PlusIcon />
            </IconButton>
          </Tooltip>
          <Tooltip content="settings">
            <IconButton radius="full">
              <PlusIcon />
            </IconButton>
          </Tooltip>
          <Tooltip content="settings">
            <IconButton radius="full">
              <PlusIcon />
            </IconButton>
          </Tooltip>
          <Tooltip content="settings">
            <IconButton radius="full">
              <PlusIcon />
            </IconButton>
          </Tooltip>
        </nav>
        <nav className="mt-auto grid gap-1 p-2">
          <Tooltip content="settings">
            <IconButton radius="full">
              <PlusIcon />
            </IconButton>
          </Tooltip>
        </nav>
      </aside>
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-[53px] items-center gap-1 border-b bg-background px-4">
          <h1 className="text-xl font-semibold">Playground</h1>
        </header>
      </div>
      <main className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="relative hidden flex-col items-start gap-8 md:flex">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            <div className="sm:col-span-2">
              Introducing Our Dynamic Orders Dashboard for Seamless Management
              and Insightful Analysis.
            </div>
            <div>
              Introducing Our Dynamic Orders Dashboard for Seamless Management
              and Insightful Analysis.
            </div>
            <div>
              Introducing Our Dynamic Orders Dashboard for Seamless Management
              and Insightful Analysis.
            </div>
          </div>
        </div>
        <div>
          <div className="overflow-hidden">
            <div className="flex flex-row items-start bg-muted/50">
              <div className="grid gap-0.5">
                <div className="group flex items-center gap-2 text-lg">
                  Order Oe31b70H
                </div>
              </div>
              <div className="ml-auto flex items-center gap-1">deez</div>
            </div>
            <div className="p-6 text-sm">
              <div className="grid gap-3">
                <div className="font-semibold">Order Details</div>
                <ul className="grid gap-3">
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Glimmer Lamps x <span>2</span>
                    </span>
                    <span>$250.00</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Aqua Filters x <span>1</span>
                    </span>
                    <span>$49.00</span>
                  </li>
                </ul>

                <ul className="grid gap-3">
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>$299.00</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>$5.00</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>$25.00</span>
                  </li>
                  <li className="flex items-center justify-between font-semibold">
                    <span className="text-muted-foreground">Total</span>
                    <span>$329.00</span>
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-3">
                  <div className="font-semibold">Shipping Information</div>
                  <address className="grid gap-0.5 not-italic text-muted-foreground">
                    <span>Liam Johnson</span>
                    <span>1234 Main St.</span>
                    <span>Anytown, CA 12345</span>
                  </address>
                </div>
                <div className="grid auto-rows-max gap-3">
                  <div className="font-semibold">Billing Information</div>
                  <div className="text-muted-foreground">
                    Same as shipping address
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="font-semibold">Customer Information</div>
                <dl className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Customer</dt>
                    <dd>Liam Johnson</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Email</dt>
                    <dd>
                      <a href="mailto:">liam@acme.com</a>
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Phone</dt>
                    <dd>
                      <a href="tel:">+1 234 567 890</a>
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="grid gap-3">
                <div className="font-semibold">Payment Information</div>
                <dl className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-1 text-muted-foreground">
                      Visa
                    </dt>
                    <dd>**** **** **** 4532</dd>
                  </div>
                </dl>
              </div>
            </div>
            <div className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
              <div className="text-xs text-muted-foreground">
                Updated <time dateTime="2023-11-23">November 23, 2023</time>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* <Sidebar />
        <div className="relative col-span-10 mx-32 lg:mx-24">
          <div className="px-2 pt-10 bg-transparent rounded-sm flex justify center content-center cursor-default w-full appearance-none">
            <div className="h-[calc(100vh-225px)] w-full rounded-xl p-12 overflow-auto">
              <div className="whitespace-pre-line  w-full pr-4">
                <div className="pb-4">
                  {response &&
                    response.map((chat) => (
                      <div className="py-3">
                        {chat.message?.content ? (
                          <ResponseBox
                            message={chat.message?.content}
                            username="Cringe"
                            isBot={true}
                          />
                        ) : (
                          <ResponseBox
                            message={chat.messages[0].content}
                            username="You"
                            isBot={false}
                          />
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
          <div className="absolute w-full bottom-4 justify-center items-center">
            <SummarizeForm setResponse={handleMessageSend} />
            <div className="flex p-0 pt-3 w-full justify-center items-center">
              <Text color="gray" weight="light" size="1">
                Please remember to use AI responsibly.
              </Text>
            </div>
          </div>
        </div>
      </div>
    </div> */}
    </div>
  );
}
