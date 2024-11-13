import { sql } from "@vercel/postgres";
import { checkSession, unauthorizedResponse } from "../lib/session";

export const config = {
  runtime: "edge",
};

export default async function handler(request) {
  try {
    const connected = await checkSession(request);
    if (!connected) {
      console.log("Not connected");
      return unauthorizedResponse();
    }
    const {sender_id,receiver_id} = await request.json();

    if (!sender_id || !receiver_id) {
      return new Response("Missing required fields", {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }
    const { rowCount, rows } = await sql`
    SELECT
    id,
    sender_id,
    receiver_id,
    message_text,
    TO_CHAR(timestamp, 'DD/MM/YYYY HH24:MI') as timestamp
    FROM
        messages
    WHERE
        (sender_id = ${sender_id} AND receiver_id = ${receiver_id})
        OR
        (sender_id = ${receiver_id} AND receiver_id = ${sender_id})
    ORDER BY
        timestamp ASC;
    `;

    if (rowCount === 0) {
        /* Vercel bug doesn't allow 204 response status */
        return new Response("[]", {
            status: 200,
            headers: {'content-type': 'application/json'},
        });
    }
    else {
        return new Response(JSON.stringify(rows), {
            status: 200,
            headers: {'content-type': 'application/json'},
        });
    }
  }
    catch (error) {
    console.error(error);
    return new Response(JSON.stringify(error), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
