import {Heading, Separator} from "@radix-ui/themes";

const Sidebar = () => {
    return (
        <div className="col-span-2 border-r dark:border-white/50 h-full items-center">
            <div className="mx-4 my-6">
                <div className="mb-4 flex justify-between items-end">
                    <div>
                        <Heading size="7">Model Parameters</Heading>
                        <Heading color="gray" size="1" weight="medium">Fine-tune your model based on your specific
                            needs</Heading>
                    </div>
                </div>
                <Separator size="4"/>
            </div>
        </div>
    );
}

export default Sidebar;
