sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "grcmom/controller/View11controller"
], function (Controller, MessageToast, View11controller) {
    "use strict";

    return Controller.extend("grcmom.controller.View1", {
        transcriptKeywords: ["recording", "afternoon", "welcome", "session", "guidelines", "proposing", "coverage", "processing", "noted", "Excel", "visible"],
        
        preprocess_transcript: function(transcript) {
            // Regex pattern to match timestamps
            var timestamp_pattern = /\d+:\d+:\d+\.\d+ --> \d+:\d+:\d+\.\d+\n/g;
            transcript = transcript.replace(timestamp_pattern, '');

            // Regex pattern to match speaker names
            var speaker_pattern = /\n\.,? [A-Za-z]+\n/g;
            transcript = transcript.replace(speaker_pattern, '\n');

            // Replace double newlines with a single newline
            transcript = transcript.replace(/\n\n/g, '\n');

            return transcript.trim();
        },

        verifyTranscript: function (text) {
            return this.transcriptKeywords.some(keyword => text.includes(keyword));
        },

        onResetPress: function () {
            const oTextArea = this.byId("textarea");
            const oParagraphText = this.byId("paragraphText");
            const oSubmitButton = this.byId("Submit");
            const oLabel = this.byId("label1");
            const oOpenMailButton = this.byId("openMailButton");

            if (oTextArea) {
                oTextArea.setValue("");
                oTextArea.setVisible(true);
            }
            if (oParagraphText) {
                oParagraphText.setVisible(false);
            }
            if (oSubmitButton) {
                oSubmitButton.setText("Generate MOM");
                oSubmitButton.setEnabled(true);
            }
            if (oLabel) {
                oLabel.setText("Enter your transcript here.");
            }
            if (oOpenMailButton) {
                oOpenMailButton.setVisible(false);
            }
        },

        onSubmitPress: async function () {
            const oTextArea = this.byId("textarea");

            if (oTextArea) {
                const textValue = oTextArea.getValue().trim();

                if (textValue === "") {
                    MessageToast.show("Please enter the transcript.");
                    return;
                }

                if (this.verifyTranscript(textValue)) {
                    await getAPIToken()
                        .then(data => console.log(data))
                        .catch(error => console.error(error));

                    console.log("On Answering Query", textValue);
                    var ptran = this.preprocess_transcript(textValue);
                    console.log(" preprocess trans data ", textValue);

                    var final_data = await this.getFastApiResponce(ptran);

                    console.log("fast api data ", final_data);

                    MessageToast.show("Transcript submitted successfully.");
                } else {
                    MessageToast.show("The entered text is not a transcript.");
                    return;
                }

                oTextArea.setVisible(false);

                const oParagraphText = this.byId("paragraphText");
                if (oParagraphText) {
                    oParagraphText.setText(final_data);
                    oParagraphText.setVisible(true);
                }

                const oSubmitButton = this.byId("Submit");
                if (oSubmitButton) {
                    oSubmitButton.setText("Generate MOM");
                    oSubmitButton.setEnabled(false);
                }

                const oLabel = this.byId("label1");
                if (oLabel) {
                    oLabel.setText("Transcript Result.");
                }

                const oOpenMailButton = this.byId("openMailButton");
                if (oOpenMailButton) {
                    oOpenMailButton.setVisible(true);
                    const emailAddress = "Himanshu.gupta07@sap.com";
                    const mailtoLink = `mailto:${encodeURIComponent(emailAddress)}?body=${encodeURIComponent(final_data)}`;
                    oOpenMailButton.data("mailtoLink", mailtoLink);
                }
            }
        },

        onAnsweringQuery: function (usertext) {
            const resourceGroup = "e280c7a4-3339-4ac0-a5c2-4a575e88025a";
            const deploymentUrl = "https://api.ai.prod.eu-central-1.aws.ml.hana.ondemand.com/v2/inference/deployments/d96914c7500a199f";
            const modelName = "gpt-35-turbo";
            const modelInputList = [{ role: "user", content: usertext }];

            queryAnswering(deploymentUrl, resourceGroup, modelName, modelInputList)
                .then(data => console.log(data))
                .catch(error => console.error(error));
        },

        getFastApiResponce: async function (usertext) {
            const Prm1 = "You are an AI expert in analysing conversations and extracting action items. Please review the text and identify any tasks, assignments, or actions that were agreed upon or mentioned as needing to be done. These could be tasks assigned to specific individuals, or general actions that the group has decided to take. Please list all the action items clearly and concisely. Also mention the names of the person whom any tasks are assigned and cover the important timelines of the tasks if mentioned in the text, please specify dates also if given. Also mention the brainstorming topic if any discussed in the text.";
            const payload = JSON.stringify({ query: Prm1 + usertext });

            console.log("In Test Payload:", payload);

            try {
                const response = await $.ajax({
                    url: "https://grc_mom-fastapi-app-terrific-koala-id.cfapps.eu12.hana.ondemand.com/input",
                    type: "POST",
                    data: payload,
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

                console.log("In Test Data:", response);
                return response;
            } catch (error) {
                console.error(error);
                return null;
            }
        },

        onOpenMailPress: function () {
            const oOpenMailButton = this.byId("openMailButton");
            if (oOpenMailButton) {
                const mailtoLink = oOpenMailButton.data("mailtoLink");
                if (mailtoLink) {
                    window.location.href = mailtoLink;
                }
            }
        }
    });
});
