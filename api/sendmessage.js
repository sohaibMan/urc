import {db, sql} from "@vercel/postgres";
import {checkSession, unauthorizedResponse} from "../lib/session";
import PushNotifications from "@pusher/push-notifications-server";

export default async function handler(request) {
    try {
        const connected = await checkSession(request);
        if (!connected) {
            console.log("Not connected");
            return unauthorizedResponse();
        }

        // Parse the JSON body
        const {sender_id, receiver_id, message_text} = request.body;

        if (!sender_id || !receiver_id || !message_text) {
            return new Response("Missing required fields", {
                status: 400,
                headers: {"content-type": "application/json"},
            });
        }

        const {rowCount} = await sql`
            INSERT INTO messages (sender_id, receiver_id, message_text)
            VALUES (${sender_id}, ${receiver_id}, ${message_text})
        `;

        console.log(rowCount + " message inserted");

        const beamsClient = new PushNotifications({
            instanceId: process.env.REACT_APP_PUSHER_INSTANCE_ID,
            secretKey: process.env.PUSHER_SECRET_KEY,
        });

        const client = await db.connect();
        const query = `SELECT external_id
                       FROM users
                       WHERE user_id = $1`;
        const {rows} = await client.query(query, [sender_id]);
        client.release();

        if (!rows.length) {
            return new Response("User not found", {
                status: 404,
                headers: {"content-type": "application/json"},
            });
        }

        const {external_id: externalId} = rows[0];
        beamsClient.publishToUsers([externalId], {
            web: {
                notification: {
                    title: `New message from ${sender_id}`,
                    body: message_text,
                    icon: "https://www.univ-brest.fr/themes/custom/ubo_parent/favicon.ico",
                    deep_link: `${process.env.APP_URL}/messages/user/${sender_id}`,
                },
                data: {},
            },
        }).then((publishResponse) => {
            console.log("Just published:", publishResponse.publishId);
        }
        ).catch((error) => {
            console.log("Error:", error);
        });


        return new Response("Message inserted successfully", {
            status: 200,
            headers: {"content-type": "application/json"},
        });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify(error), {
            status: 500,
            headers: {"content-type": "application/json"},
        });
    }
}
