type Data = {
    Indonesia: string,
    Rejang: string
}

type userType = {
    _id?: any;
    id?: string;
    username: string;
    password?: string;
    desc?: string;
    atmin?: boolean;
    accessToken?: {
        accessNow: string;
        timeBefore: string;
    };
};