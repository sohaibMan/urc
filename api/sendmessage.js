import { db } from "@vercel/postgres";
import { checkSession, unauthorizedResponse } from "../lib/session";
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
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Step 2: Parse and validate request body
        const { sender_id, receiver_id, message_text } = req.body;

        if (!sender_id || !receiver_id || !message_text) {
            return res
                .status(400)
                .json({ error: "Missing required fields" });
        }

        // Step 3: Insert the message into the database
        const client = await db.connect();
        let insertedMessage;

        try {
            console.time("Database Insertion");
            const { rows, rowCount } = await client.query(
                `
                INSERT INTO messages (sender_id, receiver_id, message_text)
                VALUES ($1, $2, $3) RETURNING *
            `,
                [sender_id, receiver_id, message_text]
            );
            console.timeEnd("Database Insertion");

            if (rowCount === 0) {
                throw new Error("Failed to insert message");
            }

            insertedMessage = rows[0];
        } finally {
            client.release();
        }

        console.log("Message inserted:", insertedMessage);

        // Step 4: Fetch the external_id for the sender
        let externalId;
        try {
            console.time("Fetch External ID");
            const { rows: users } = await db.query(
                `SELECT external_id FROM users WHERE user_id = $1`,
                [sender_id]
            );
            console.timeEnd("Fetch External ID");

            if (users.length === 0) {
                return res.status(404).json({ error: "Sender user not found" });
            }

            externalId = users[0].external_id;
        } catch (error) {
            console.error("Error fetching external ID:", error);
            throw new Error("Failed to fetch sender external ID");
        }

        // Step 5: Send push notification
        try {
            console.time("Push Notification");
            const beamsClient = new PushNotifications({
                instanceId: process.env.REACT_APP_PUSHER_INSTANCE_ID,
                secretKey: process.env.PUSHER_SECRET_KEY,
            });

            await beamsClient.publishToUsers([externalId], {
                web: {
                    notification: {
                        title: `New message from ${sender_id}`,
                        body: message_text,
                        icon: "https://www.univ-brest.fr/themes/custom/ubo_parent/favicon.ico",
                        deep_link: `${process.env.APP_URL}/messages/user/${sender_id}`,
                    },
                    data: {},
                },
            });
            console.timeEnd("Push Notification");
        } catch (error) {
            console.error("Error sending push notification:", error);
        }

        console.timeEnd("Request Processing");

        // Return success response
        return res
            .status(200)
            .json({ message: "Message inserted successfully" });
    } catch (error) {
        console.error("Unexpected error:", error);
        return res.status(500).json({
            error: "Internal server error",
            details: error.message,
        });
    }
}
