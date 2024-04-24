import {Heading, Select, Separator, Skeleton, TextArea, TextFieldInput} from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import getModels from "../../api/getModels";

const Sidebar = () => {
    const models = useQuery({
        queryKey: ['models'],
        queryFn: getModels
    })
    console.log(models)
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
                <div className="pt-4">
                    <Heading className="pb-1" size="2">
                        Model
                    </Heading>
                    {models.isLoading && <Skeleton>Loading</Skeleton>}
                    <Select.Root>
                        <Select.Trigger className="w-full" placeholder="pick a model"/>
                        <Select.Content>
                            <Select.Group>
                                <Select.Label>
                                    Local Models
                                </Select.Label>
                                {models.data?.models.map((model: any) => (
                                    <Select.Item value={model.model}>
                                        {model.model}
                                    </Select.Item>
                                ))}
                            </Select.Group>
                        </Select.Content>
                    </Select.Root>
                </div>
                <div className="pt-4">
                    <Heading className="pb-1" size="2">
                        Temperature
                    </Heading>
                    <TextFieldInput></TextFieldInput>
                </div>
                <div className="pt-4">
                    <Heading className="pb-1" size="2">
                        Top_P
                    </Heading>
                    <TextFieldInput></TextFieldInput>
                </div>
                <div className="pt-4">
                    <Heading className="pb-1" size="2">
                        Top_K
                    </Heading>
                    <TextFieldInput></TextFieldInput>
                </div>
                <div className="pt-4">
                    <Heading className="pb-1" size="2">
                        System Prompt
                    </Heading>
                    <TextArea rows={5} placeholder="Leave blank for default"></TextArea>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;
