sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/BusyIndicator"
], function (Controller, MessageToast, JSONModel, BusyIndicator) {
    "use strict";
    let selectedKey = "default";  
    return Controller.extend("grcmom.controller.View1", {
        transcriptKeywords: ["recording", "afternoon", "welcome", "session", "guidelines", "proposing", "coverage", "processing", "noted", "Excel", "visible"],
        
        onInit: function() {
            var oData = {
              items: [
                { key: "default", text: "Generic Meeting" },
                { key: "kickoff", text: "Kickoff/Coffee Corner Meeting" },
                { key: "technical", text: "Technical Meeting" }
              ]
            };
      
            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel);
        },

        onSelectionChange: function(oEvent) {
            var selectedItem = oEvent.getParameter("selectedItem");
            selectedKey = selectedItem.getKey();
            var selectedText = selectedItem.getText();
      
            // Handle selection change logic here
            console.log("Selected Key:", selectedKey);
            console.log("Selected Text:", selectedText);
        },

        preprocessText: function (text) {
            // Remove timestamp patterns
            var timestampPattern = /\d+:\d+:\d+\.\d+ --> \d+:\d+:\d+\.\d+\n/g;
            text = text.replace(timestampPattern, '');
        
            // Remove speaker patterns
            var speakerPattern = /\n\.,? [A-Za-z]+\n/g;
            text = text.replace(speakerPattern, '\n');
        
            // Remove extra newlines
            text = text.replace(/\n\n/g, '\n');
        
            // Convert to lowercase
            text = text.toLowerCase();
        
            // Remove punctuation (except for spaces and alphanumeric characters)
            text = text.replace(/[^\w\s]/g, '');
        
            // Define stopwords
            const stopwords = [' i ', ' me ', ' my ', ' myself ', ' we ', ' our ', ' ours ', ' ourselves ', ' you ', ' your ', ' yours ', ' yourself ', ' yourselves ', ' he ', ' him ', ' his ', ' himself ', ' she ', ' her ', ' hers ', ' herself ', ' it ', ' its ', ' itself ', ' they ', ' them ', ' their ', ' theirs ', ' themselves ', ' what ', ' which ', ' who ', ' whom ', ' this ', ' that ', ' these ', ' those ', ' am ', ' is ', ' are ', ' was ', ' were ', ' be ', ' been ', ' being ', ' have ', ' has ', ' had ', ' having ', ' do ', ' does ', ' did ', ' doing ', ' a ', ' an ', ' the ', ' and ', ' but ', ' if ', ' or ', ' because ', ' as ', ' until ', ' while ', ' of ', ' at ', ' by ', ' for ', ' with ', ' about ', ' against ', ' between ', ' into ', ' through ', ' during ', ' before ', ' after ', ' above ', ' below ', ' to ', ' from ', ' up ', ' down ', ' in ', ' out ', ' on ', ' off ', ' over ', ' under ', ' again ', ' further ', ' then ', ' once ', ' here ', ' there ', ' when ', ' where ', ' why ', ' how ', ' all ', ' any ', ' both ', ' each ', ' few ', ' more ', ' most ', ' other ', ' some ', ' such ', ' no ', ' nor ', ' not ', ' only ', ' own ', ' same ', ' so ', ' than ', ' too ', ' very ', ' s ', ' t ', ' can ', ' will ', ' just ', ' don ', ' should ', ' now '];
        
            // Remove stopwords
            stopwords.forEach(function(stopword) {
                var stopwordPattern = new RegExp('\\b' + stopword.trim() + '\\b', 'g');
                text = text.replace(stopwordPattern, ' ');
            });
        
            // Replace multiple spaces with a single space
            text = text.replace(/\s+/g, ' ').trim();
        
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
            const oComboBox = this.byId("meetingType");
            const oMeetingType = this.byId("selectMeetingType");

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
            if (oComboBox) {
                oComboBox.setVisible(true);
            }
            if (oMeetingType) {
                oMeetingType.setVisible(true);
            }
        },

        onSubmitPress: async function () {
            const oTextArea = this.byId("textarea");
            const oComboBox = this.byId("meetingType");
            const oMeetingType = this.byId("selectMeetingType");

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
                        oComboBox.setVisible(false);
                        oMeetingType.setVisible(false);
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
            const defaultPrompt = "You are an AI expert in analysing conversations and extracting action items , points discussed & summary.Please review the text and identify any tasks, assignments, or actions that were agreed upon or mentioned as needing to be done. These could be tasks assigned to specific individuals, or general actions that the group has decided to take. Please list all the action items clearly and concisely in the format 'action item - assigned to , by Due date'. Mention all important points. Then mention the 'points discussed' in form of bullet points. In the end write the summary of the meeting topic.";
            const kickoffPrompt="You are an AI expert in extracting information from kick-off meetings. Please give the goals and strategies of the current and next year. Please tell me the key discussions of the meeting, timelines and milestones of the tasks if discussed in the meeting, action items and next steps which is discussed in the meeting and any other additional important information. Please mention the strategic topics clearly which are discussed in the meeting with the name of the person who talked about it if applicable. In the end write the summary of the kick-off meeting with all important points";
            const technicalPrompt= "You are an AI expert in extracting information from any kind of technical discussion. Extract the purpose and objectives of the meeting in a short paragraphs. Review and mention any technical information which could be related to but not limited to SAP systems, business users, login credentials, timelines and anything related to test strategy if being discussed in meaningful sentences or paragraphs in detail. write action items in the format 'action item-person responsible-timeline'. write new functionality or any technical topics or aspects if discussed. Try not to repeat any information. In the end write the summary with all important points discussed.";
           if(selectedKey =="kickoff")
            {
                prompt = kickoffPrompt;
            }
            else if(selectedKey =="technical")
            {
                prompt = technicalPrompt;
            }
            else
            {
                prompt= defaultPrompt;
            }
            const payload = JSON.stringify({ query: prompt + usertext });

            console.log("Test Payload Ritika Test:", payload);

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
