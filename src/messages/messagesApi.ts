import { Message } from "../model/common";

export async function sendMessage(message : Message): Promise<void> {
    try {
      const response = await fetch("/api/sendmessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authentication": "Bearer " + sessionStorage.getItem("token"),
        },
        body: JSON.stringify({sender_id: message.sender_id, receiver_id: message.receiver_id, message_text: message.message_text}),
      });

      if (response.ok) {
        // const users = await response.json();
        console.log("Message envoyé !");
        // Utiliser la liste des utilisateurs récupérée
      } else {
        try {
          const errorResponse = await response.json();
          // Gérer l'erreur côté client (ex: afficher un message d'erreur)
          console.error("Erreur côté serveur:", errorResponse);
        } catch (error) {
          console.error("Erreur lors de la conversion de la réponse JSON:", error);
        }
        // Retourner un tableau vide en cas d'erreur
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      // Retourner un tableau vide en cas d'erreur
    }
  }


export async function getMessages(message : Message): Promise<Message[]> {
  try {
    const response = await fetch("/api/getmessages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authentication": "Bearer " + sessionStorage.getItem("token"),
      },
      body: JSON.stringify({sender_id: message.sender_id, receiver_id: message.receiver_id}),
    });

    if (response.ok) {
      const messages = await response.json();
      return messages as Message[];
      // console.log("Message envoyé !");
    } else {
      try {
        const errorResponse = await response.json();
        // Gérer l'erreur côté client (ex: afficher un message d'erreur)
        console.error("Erreur côté serveur:", errorResponse);
      } catch (error) {
        console.error("Erreur lors de la conversion de la réponse JSON:", error);
      }
        // Retourner un tableau vide en cas d'erreur
        return [];
      }
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error);
    // Retourner un tableau vide en cas d'erreur
    return [];
  }
}
