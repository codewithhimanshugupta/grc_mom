sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("grcmom.controller.View1", {
        onResetPress: function () {
            var oTextArea = this.byId("textarea");
            if (oTextArea) {
                oTextArea.setValue("");
            } else {
                console.error("TextArea not found.");
            }

            // Hide the paragraph
            var oParagraphText = this.byId("paragraphText");
            if (oParagraphText) {
                oParagraphText.setVisible(false);
            } else {
                console.error("ParagraphText not found.");
            }

            // Show the textarea
            var oTextArea = this.byId("textarea");
            if (oTextArea) {
                oTextArea.setVisible(true);
            } else {
                console.error("TextArea not found.");
            }
        },

        onSubmitPress: function () {
            var oTextArea = this.byId("textarea");
            if (oTextArea) {
                var textValue = oTextArea.getValue();
                console.log("Text Value:", textValue);

                // Set the text value in session storage
                sessionStorage.setItem("text1", textValue);
                // Log the value stored in session storage
                console.log("Value stored in session storage:", sessionStorage.getItem("text1"));

                // Hide the textarea
                oTextArea.setVisible(false);

                // Show the paragraph
                var oParagraphText = this.byId("paragraphText");
                if (oParagraphText) {
                    oParagraphText.setText(textValue);
                    oParagraphText.setVisible(true);
                } else {
                    console.error("ParagraphText not found.");
                }
            } else {
                console.error("TextArea not found.");
            }
        }
    });
});
