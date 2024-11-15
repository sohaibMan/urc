import {getConnecterUser, triggerNotConnected} from "../lib/session";

import PushNotifications from "@pusher/push-notifications-server";


export default async function handler(req, res) {

    const userIDInQueryParam = req.query["user_id"];
    const user = await getConnecterUser(req);
    console.log("PushToken : " + userIDInQueryParam + " -> " + JSON.stringify(user));
    if (user === undefined || user === null || userIDInQueryParam !== user.externalId) {
        console.log("Not connected");
        triggerNotConnected(res);
        return;
    }

    console.log("Using push instance : " + process.env.REACT_APP_PUSHER_INSTANCE_ID);
    const beamsClient = new PushNotifications({
        instanceId: process.env.REACT_APP_PUSHER_INSTANCE_ID,
        secretKey: process.env.PUSHER_SECRET_KEY,
    });

    const beamsToken = beamsClient.generateToken(user.externalId);
    console.log(JSON.stringify(beamsToken));
    res.send(beamsToken);
}
