import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";

class FirebaseService {
  private messaging: admin.messaging.Messaging;
  private initialized: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      // Buscar el archivo de credenciales
      const credentialsPath = path.join(
        __dirname,
        "../../pwa-wolksafe-firebase-adminsdk-fbsvc-b8759b36aa.json"
      );

      if (!fs.existsSync(credentialsPath)) {
        console.error(
          "[Firebase] Archivo de credenciales no encontrado:",
          credentialsPath
        );
        return;
      }

      const serviceAccount = JSON.parse(fs.readFileSync(credentialsPath, "utf8"));
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      this.sendNotification('cDHUYlUuY2pQidM8qQjoEs:APA91bFMjcRvQq5lsD8cDn8YBFTCyOQ-ZLi8PTyN1iYifrOBqoQ_pPfJUELbMZpxnhPyR7GvHlqHPu8Cl2lh-_eE4QqCRELdttw5JDTa7sVgxu-0RvTyXPk','Hola','Juan')

      this.messaging = admin.messaging();
      this.initialized = true;
      console.log("[Firebase] Inicializado correctamente");
    } catch (e) {
      console.error("[Firebase] Error inicializando:", e);
      this.initialized = false;
    }
  }

  /**
   * Enviar notificación a un dispositivo específico
   */
  async sendNotification(
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>,
    imageUrl?: string
  ): Promise<string | null> {
    if (!this.initialized) {
      console.error("[Firebase] Firebase no está inicializado");
      return null;
    }

    if (!token) {
      console.error("[Firebase] Token vacío");
      return null;
    }

    try {
      const message: admin.messaging.Message = {
        notification: {
          title: title || "Notificación",
          body: body || "",
          imageUrl: imageUrl,
        },
        data: {
          timestamp: new Date().toISOString(),
          ...data,
        },
        token,
      };

      const messageId = await this.messaging.send(message);
      console.log("[Firebase] Notificación enviada. ID:", messageId);
      return messageId;
    } catch (error) {
      console.error("[Firebase] Error enviando notificación:", error);
      return null;
    }
  }

  /**
   * Enviar notificación a múltiples dispositivos
   */
  async sendNotificationToMultiple(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>
  ): Promise<admin.messaging.BatchResponse | null> {
    if (!this.initialized) {
      console.error("[Firebase] Firebase no está inicializado");
      return null;
    }

    if (tokens.length === 0) {
      console.error("[Firebase] No hay tokens");
      return null;
    }

    try {
      const message: admin.messaging.MulticastMessage = {
        notification: {
          title: title || "Notificación",
          body: body || "",
        },
        data: {
          timestamp: new Date().toISOString(),
          ...data,
        },
        tokens,
      };

      const response = await this.messaging.sendEach(
        tokens.map(token => ({
          notification: {
            title: title || "Notificación",
            body: body || "",
          },
          data: {
            timestamp: new Date().toISOString(),
            ...data,
          },
          token,
        }))
      );
      console.log(`[Firebase] Notificaciones enviadas. Success: ${response.successCount}, Failure: ${response.failureCount}`);
      
      // Eliminar tokens inválidos
      response.responses.forEach((resp, index) => {
        if (!resp.success) {
          console.error(`[Firebase] Error enviando a token ${tokens[index]}:`, resp.error);
        }
      });

      return response;
    } catch (error) {
      console.error("[Firebase] Error enviando notificaciones múltiples:", error);
      return null;
    }
  }

  /**
   * Suscribir token a un topic
   */
  async subscribeToTopic(tokens: string[], topic: string): Promise<void> {
    if (!this.initialized) {
      console.error("[Firebase] Firebase no está inicializado");
      return;
    }

    try {
      await this.messaging.subscribeToTopic(tokens, topic);
      console.log(`[Firebase] ${tokens.length} tokens suscritos al topic '${topic}'`);
    } catch (error) {
      console.error("[Firebase] Error suscribiendo a topic:", error);
    }
  }

  /**
   * Desuscribir token de un topic
   */
  async unsubscribeFromTopic(tokens: string[], topic: string): Promise<void> {
    if (!this.initialized) {
      console.error("[Firebase] Firebase no está inicializado");
      return;
    }

    try {
      await this.messaging.unsubscribeFromTopic(tokens, topic);
      console.log(`[Firebase] ${tokens.length} tokens desuscritos del topic '${topic}'`);
    } catch (error) {
      console.error("[Firebase] Error desuscribiendo de topic:", error);
    }
  }

  /**
   * Enviar notificación a un topic
   */
  async sendNotificationToTopic(
    topic: string,
    title: string,
    body: string,
    data?: Record<string, string>
  ): Promise<string | null> {
    if (!this.initialized) {
      console.error("[Firebase] Firebase no está inicializado");
      return null;
    }

    try {
      const message: admin.messaging.Message = {
        notification: {
          title: title || "Notificación",
          body: body || "",
        },
        data: {
          timestamp: new Date().toISOString(),
          ...data,
        },
        topic,
      };

      const messageId = await this.messaging.send(message);
      console.log("[Firebase] Notificación enviada al topic:", messageId);
      return messageId;
    } catch (error) {
      console.error("[Firebase] Error enviando a topic:", error);
      return null;
    }
  }
}

export default new FirebaseService();
