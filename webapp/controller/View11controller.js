import { readFileSync } from "fs";
import fetch from "node-fetch"; // Ensure you have installed node-fetch using npm
import btoa from "btoa"; // Ensure you have installed btoa using npm

// change service-key.txt to your own service key file name here 
let contents = readFileSync("service-key.txt").toString();
const serviceKey = JSON.parse(contents);



async function getAPIToken() {
    var clientId = serviceKey['clientid'];
    var clientSecret = serviceKey['clientsecret'];
    var authUrl = serviceKey['url'];
    var baseAuth = btoa(`${clientId}:${clientSecret}`);
    try {
        const response = await fetch(
            `${authUrl}/oauth/token?grant_type=client_credentials`,
            {
                method: "GET",
                headers: {
                    Authorization: `Basic ${baseAuth}`
                }
            }
        );
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log(`Successfully retrieved API token`);
        return data.access_token;
    } catch (error) {
        console.error(error);
    }
}

async function queryAnswering(deploymentUrl, resourceGroup, modelName, modelInputList) {
    var apiToken = await getAPIToken();
    const payload = JSON.stringify({
        "model": modelName,
        "messages": modelInputList
    });
    // console.log(payload);
    try {
        const response = await fetch(
            `${deploymentUrl}/chat/completions?api-version=2023-05-15`,
            {
                method: "POST",
                body: payload,
                headers: {
                    "Authorization": `Bearer ${apiToken}`,
                    'ai-resource-group': resourceGroup,
                    "Content-Type": "application/json"
                }
            }
        );
        const data = await response.json();
        // console.log(data);
        return data;
    } catch (error) {
        if (error.response) {
            console.log("The request was made and the server responded with a code that falls out of the range of 2xx");
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
        } else if (error.request) {
            console.log("The request was made but no response was received");
            console.log(error.request);
        } else {
            console.log("Something happened in setting up the request and triggered an Error");
            console.log('Error', error.message);
        }
        console.log(error);
    }
}
// Example usage
async function main_func(usertext) {
    // configuring your own resource group, as per the information of your assigned AI Core instance
const resourceGroup = "e280c7a4-3339-4ac0-a5c2-4a575e88025a";
const deploymentUrl= "https://api.ai.prod.eu-central-1.aws.ml.hana.ondemand.com/v2/inference/deployments/d96914c7500a199f"; 
// 5 deployment urls in total are available. Specify the model you want.
    const modelName = "gpt-35-turbo";
    const modelInputList = [
        {
            role: "user",
            content: usertext
        }
    ];

    const response = await queryAnswering(deploymentUrl, resourceGroup, modelName, modelInputList);
    return response.choices[0].message.content;
};

// Example usage of main_func
main_func("data").then((res) => {
    console.log(res);
}).catch((error) => {
    console.error("Error:", error);
});



