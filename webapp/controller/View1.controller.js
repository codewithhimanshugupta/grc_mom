sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "grcmom/controller/View11controller"

], function (Controller, MessageToast, View11controller) {
    "use strict";

    return Controller.extend("grcmom.controller.View1", {
        transcriptKeywords: ["recording","afternoon","welcome","session","guidelines","proposing","coverage","processing","noted","Excel","visible"],
        verifyTranscript: function (text) {
            for (var i = 0; i < this.transcriptKeywords.length; i++) {
                if (text.includes(this.transcriptKeywords[i])) {
                    return true;
                }
            }
            return false;
        },

        onResetPress: function () {
            var oTextArea = this.byId("textarea");
            if (oTextArea) {
                oTextArea.setValue("");
                oTextArea.setVisible(true);
            }

            var oParagraphText = this.byId("paragraphText");
            if (oParagraphText) {
                oParagraphText.setVisible(false);
            }

            var oSubmitButton = this.byId("Submit");
            if (oSubmitButton) {
                oSubmitButton.setText("Generate MOM");
                oSubmitButton.setEnabled(true);
            }

            var oLabel = this.byId("label1");
            if (oLabel) {
                oLabel.setText("Enter your transcript here.");
            }

            var oOpenMailButton = this.byId("openMailButton");
            if (oOpenMailButton) {
                oOpenMailButton.setVisible(false);
            }
        },

        onSubmitPress: function () {
            var oTextArea = this.byId("textarea");
            if (oTextArea) {
                var textValue = oTextArea.getValue();

                if (textValue.trim() === "") {
                    MessageToast.show("Please enter the transcript.");
                    return;
                }

                if (this.verifyTranscript(textValue)) {
                    getAPIToken().then(data => {
                        console.log(data); // Logs "Data fetched successfully!" after 1 second
                    }).catch(error => {
                        console.error(error); // Handle any potential errors
                    });
                   
                    console.log("On Answering Query"+ textValue);
                    //this.onAnsweringQuery(textValue);
                    this.getFastApiResponce(textValue);

                    MessageToast.show("Transcript submitted successfully.");
                } else {
                    MessageToast.show("The entered text is not a transcript.");
                    return;
                }
                

                oTextArea.setVisible(false);

                var oParagraphText = this.byId("paragraphText");
                if (oParagraphText) {
                    oParagraphText.setText(textValue);
                    oParagraphText.setVisible(true);
                }

                var oSubmitButton = this.byId("Submit");
                if (oSubmitButton) {
                    oSubmitButton.setText("Generate MOM");
                    oSubmitButton.setEnabled(false);
                }

                var oLabel = this.byId("label1");
                if (oLabel) {
                    oLabel.setText("Transcript Result.");
                }

                var oOpenMailButton = this.byId("openMailButton");
                if (oOpenMailButton) {
                    oOpenMailButton.setVisible(true);
                    var emailAddress = "Himanshu.gupta07@sap.com";
                     var mailtoLink = "mailto:" + encodeURIComponent(emailAddress) + "?body=" + encodeURIComponent(textValue);
                    oOpenMailButton.data("mailtoLink", mailtoLink);
                }
            }
        },
        
        // Example usage
        onAnsweringQuery: function (usertext) {
            console.log("Ritika1"+usertext);
            // configuring your own resource group, as per the information of your assigned AI Core instance
            const resourceGroup = "e280c7a4-3339-4ac0-a5c2-4a575e88025a";
            const deploymentUrl = "https://api.ai.prod.eu-central-1.aws.ml.hana.ondemand.com/v2/inference/deployments/d96914c7500a199f";
            // 5 deployment urls in total are available. Specify the model you want.
            const modelName = "gpt-35-turbo";
            const modelInputList = [
                {
                    role: "user",
                    content: usertext
                }
            ];

            //const response = queryAnswering(deploymentUrl, resourceGroup, modelName, modelInputList);
            //console.log("Rrrrrrrrrrrrrrrrrrrrrrrrrrrrrr"+response);
            queryAnswering(deploymentUrl, resourceGroup, modelName, modelInputList).then(data => {
                console.log("RRRRRRRRRRRRRrrrrrrrrrrrrrrrrrrrrrrrrr");
                console.log(data); // Logs "Data fetched successfully!" after 1 second
            }).catch(error => {
                console.log("EEEEEEEEEEEEEEEEEEEEEEEeeeeeeeeeeeeeeeeeee");
                console.error(error); // Handle any potential errors
            });
            //return response.choices[0].message.content;
        },

        // getFastApiResponce function definition 
        getFastApiResponce: function (usertext) {
            const payload = JSON.stringify({
                "query": usertext
            });
            console.log("In Test Payload: "+payload);
            $.ajax({
                url: "https://grc_mom-fastapi-app-terrific-koala-id.cfapps.eu12.hana.ondemand.com/input",  
                type: "POST",  
                data: payload,
                headers: {
                    "Content-Type": "application/json"
                },
                success: function(data1){ 
                    console.log("In Test Data: "+data1);
                    //console.log(data1);
                //debugger ;          
                }.bind(this),
                error: function(){
                   // debugger;
                }
            })
        },
        
        onOpenMailPress: function () {
            var oOpenMailButton = this.byId("openMailButton");
            if (oOpenMailButton) {
                var mailtoLink = oOpenMailButton.data("mailtoLink");
                if (mailtoLink) {
                    window.location.href = mailtoLink;
                }
            }
        }
    });
});
