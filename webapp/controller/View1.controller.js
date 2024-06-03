sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
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
