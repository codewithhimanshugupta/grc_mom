sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/BusyIndicator"
], function (Controller, MessageToast, BusyIndicator) {
    "use strict";

    return Controller.extend("grcmom.controller.View1", {
        transcriptKeywords: ["recording", "afternoon", "welcome", "session", "guidelines", "proposing", "coverage", "processing", "noted", "Excel", "visible"],

        preprocessText: function (text) {
            var timestamp_pattern = /\d+:\d+:\d+\.\d+ --> \d+:\d+:\d+\.\d+\n/g;
            text = text.replace(timestamp_pattern, '');

            var speaker_pattern = /\n\.,? [A-Za-z]+\n/g;
            text = text.replace(speaker_pattern, '\n');

            text = text.replace(/\n\n/g, '\n');

            text = text.toLowerCase();
            let tokens = text.split(/\s+/);
            tokens = tokens.map(token => token.replace(/[^\w\s]/g, ''));
            tokens = tokens.map(token => token.replace(/[^a-zA-Z]/g, ''));

            const stopwords = ['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now'];
            tokens = tokens.filter(token => !stopwords.includes(token));

            tokens = tokens.map(token => {
                if (token.endsWith('s')) {
                    return token.slice(0, -1);
                }
                return token;
            });

            tokens = tokens.map(token => {
                switch (token) {
                    case "can't": return "cannot";
                    case "won't": return "will not";
                    default: return token;
                }
            });

            text = tokens.join(' ');

            return text;
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
                    BusyIndicator.show(0); // Show the BusyIndicator
                    try {
                        var ptran = this.preprocessText(textValue);
                        var final_data = await this.getFastApiResponce(ptran);
                        console.log("FastAPI data:", final_data);

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

                       
                    } catch (error) {
                        console.error("Error fetching FastAPI response:", error);
                        MessageToast.show("Error submitting transcript. Please try again later.");
                    } finally {
                        BusyIndicator.hide(); // Hide the BusyIndicator
                    }
                } else {
                    MessageToast.show("The entered text is not a transcript.");
                }
            }
        },

        getFastApiResponce: async function (usertext) {
            const Prm1 = "You are an AI expert in analysing conversations and extracting action items. Please review the text and identify any tasks, assignments, or actions that were agreed upon or mentioned as needing to be done. These could be tasks assigned to specific individuals, or general actions that the group has decided to take. Please list all the action items clearly and concisely. Also mention the names of the person whom any tasks are assigned and cover the important timelines of the tasks if mentioned in the text, please specify dates also if given. Also mention the brainstorming topic if any discussed in the text.";
            const payload = JSON.stringify({ query: Prm1 + usertext });

            console.log("Test Payload:", payload);

            try {
                const response = await $.ajax({
                    url: "https://grc_mom-fastapi-app-terrific-koala-id.cfapps.eu12.hana.ondemand.com/input",
                    type: "POST",
                    data: payload,
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

                console.log("Test Data:", response);
                return response;
            } catch (error) {
                console.error("Error in FastAPI request:", error);
                throw error;
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
