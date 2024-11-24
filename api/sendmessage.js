import {db} from "@vercel/postgres";
import {checkSession} from "../lib/session.js";
import PushNotifications from "@pusher/push-notifications-server";

export default async function handler(req, res) {
    try {
        console.time("Request Processing");

        // Step 1: Check session
        console.time("Session Check");
        const connected = await checkSession(req);
        console.timeEnd("Session Check");

        if (!connected) {
            console.log("Not connected");
            return res.status(401).json({error: "Unauthorized"});
        }

        // Step 2: Parse and validate request body
        const {sender_id, receiver_id, message_text, img_url, is_room} = req.body;

        if (!sender_id || !receiver_id || (!message_text && !img_url)) {
            return res
                .status(400)
                .json({error: "Missing required fields"});
        }

        // Step 3: Insert the message into the database
        const client = await db.connect();
        let insertedMessage;
        let result;
        try {
            console.time("Database Insertion");
            if (is_room) {
                result = await client.query(
                    `
                        INSERT INTO room_messages (sender_id, room_id, message_text, img_url)
                        VALUES ($1, $2, $3, $4) RETURNING *
                    `,
                    [sender_id, receiver_id, message_text, img_url]
                );
            } else {
                result = await client.query(
                    `
                        INSERT INTO messages (sender_id, receiver_id, message_text, img_url)
                        VALUES ($1, $2, $3, $4) RETURNING *
                    `,
                    [sender_id, receiver_id, message_text, img_url]
                );
            }
            console.timeEnd("Database Insertion");

            if (result.rowCount === 0) {
                throw new Error("Failed to insert message");
            }

            insertedMessage = result.rows[0];
        } finally {
            client.release();
        }

        console.log("Message inserted:", insertedMessage);

        // Step 4: Send push notification
        const beamsClient = new PushNotifications({
            instanceId: process.env.REACT_APP_PUSHER_INSTANCE_ID,
            secretKey: process.env.PUSHER_SECRET_KEY,
        });
        if (is_room) {
            await sendRoomNotification(beamsClient,receiver_id, sender_id, message_text);
        } else {
            await sendUserNotification(beamsClient,receiver_id, sender_id, message_text);
        }

        console.timeEnd("Request Processing");

        // Return success response
        return res
            .status(200)
            .json({message: "Message inserted successfully"});
    } catch (error) {
        console.error("Unexpected error:", error);
        return res.status(500).json({
            error: "Internal server error",
            details: error.message,
        });
    }
}

async function sendRoomNotification(beamsClient,room_id, sender_id, message_text) {
    try {
        console.time("Fetch Room Users");
        // broadcast for all useres for now because all rooms are open
        const {rows: users} = await db.query(
            `SELECT external_id  FROM users`
        );
        console.timeEnd("Fetch Room Users");

        const externalIds = users.map(user => user.external_id);

        if (externalIds.length === 0) {
            console.log("No users found in the room");
            return;
        }

        console.time("Push Notification");


        await beamsClient.publishToUsers(externalIds, {
            web: {
                notification: {
                    title: `New message in room ${room_id}`,
                    body: message_text,
                    icon: "https://www.univ-brest.fr/themes/custom/ubo_parent/favicon.ico",
                    deep_link: `${process.env.APP_URL}/rooms/${room_id}`,
                },
                data: {},
            },
        });
        console.timeEnd("Push Notification");
    } catch (error) {
        console.error("Error sending room notification:", error);
    }
}

async function sendUserNotification(beamsClient,receiver_id, sender_id, message_text) {
    try {
        console.time("Fetch External ID");
        const {rows: users} = await db.query(
            `SELECT external_id
             FROM users
             WHERE user_id = $1`,
            [receiver_id]
        );
        console.timeEnd("Fetch External ID");

        if (users.length === 0) {
            console.log("Receiver user not found");
            return;
        }

        const externalId = users[0].external_id;

        console.time("Push Notification");

        await beamsClient.publishToUsers([externalId], {
            web: {
                notification: {
                    title: `New message from ${sender_id}`,
                    body: message_text,
                    icon: "https://www.univ-brest.fr/themes/custom/ubo_parent/favicon.ico",
                    deep_link: `${process.env.APP_URL}/messages/${sender_id}`,
                },
                data: {},
            },
        });
        console.timeEnd("Push Notification");
    } catch (error) {
        console.error("Error sending user notification:", error);
    }
}