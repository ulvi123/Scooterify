import axios from "axios";

const BASE_URL = "https://europe-west3-coscooter-eu-staging.cloudfunctions.net";
const createTheApiClient = (idToken) => {
  const instance = axios.create({
    baseURL: BASE_URL,
    params: {
      apiKey: idToken.toString(),
    },
  });

  return {
    pairScooter: async (vehicleCode) => {
      try {
        const response = await instance.post("/pairScooter", {
          data: { vehicleCode },
        });
        return response.data;
      } catch (error) {
        console.error(error);
        throw new Error(`Failed to pair the scooter:" + ${error.message}`);
      }
    },

    unpairScooter: async (vehicleId) => {
      try {
        const response = await instance.delete("/pairScooter", {
          data: { vehicleId },
        });
        return response.data;
      } catch (error) {
        throw new Error(`Failed to unpairscooter: ${error.message}`);
      }
    },
    

    SendScooterCommand: async (command, vehicleId) => {
      try {
        const response = await instance.post("/send-commands", {
          command,
          vehicleId,
        });

        return response.data;
      } catch (error) {
        throw new Error(`Failed to send a sccoter command: ${error.message}`);
      }
    },

    getUserData: async(userId)=>{
      try {
        const response  =  await instance.get(`/users/${userId}`)
        return response.data;
      } catch (error) {
        throw new Error(`Failed to get user data: ${error.message}`)
      }
    }
  };
};


export default createTheApiClient
