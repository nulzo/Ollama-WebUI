import {Settings} from "@/types/settings";

export interface User {
    id?: number;
    color?: string;
    is_admin?: boolean;
    avatar?: string;
    email?: string;
    first_name?: string;
    full_name?: string;
    last_name?: string;
    username?: string;
    is_onboarded?: string;
    settings?: Settings;
    has_conversation?: boolean;
    theme?: string;
}
