export default function DetailedChatPage() {
    return (
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
    )
}