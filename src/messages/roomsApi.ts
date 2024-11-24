import { Room } from "../model/common";

export async function listRooms(): Promise<Room[]> {
    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authentication": "Bearer " + sessionStorage.getItem("token"),
        },
      });

      if (response.ok) {
        const rooms = await response.json();
        // Utiliser la liste des utilisateurs récupérée
        return rooms as Room[];
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
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      // Retourner un tableau vide en cas d'erreur
      return [];
    }
  }
