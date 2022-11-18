import React, { useState } from "react";
import { Button, Form, TextArea, Message } from "semantic-ui-react";

export function FeedbackForm({ page }) {
  const [importance, setImportance] = useState("!");
  const [issue, setIssue] = useState("");
  const [reproduce, setReproduce] = useState("");
  const [username, setUsername] = useState("anonymous");
  const [submitted, setSubmitted] = useState(false);

  function handleChange(severity) {
    setImportance(severity);
  }

  async function sendReport() {
      let today = new Date().toLocaleDateString()
      const response = await fetch("/api/bug_reports", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          user: username,
          date: today,
          importance: importance,
          page: page,
          issue: issue,
          reproduce_bug: reproduce,
        }),
      });

      response.json().then(() => {
        console.log("issue submitted!");
        setSubmitted(true);
      });
    
  }

  return (
    <>
      <Form success={submitted}>
        <Form.Input
          control={TextArea}
          label="Your name (optional, so I can follow up if needed)"
          type="text"
          onChange={(e, { value }) => setUsername(value)}
          spellCheck="false"
        />
        <Form.Input
          className="inputID"
          control={TextArea}
          label="What issue are you having?"
          required
          type="text"
          onChange={(e, { value }) => setIssue(value)}
          spellCheck="false"
        />
        <Form.Input
          className="inputID"
          control={TextArea}
          label="Describe how to reproduce it (if you think it's a bug)"
          type="text"
          onChange={(e, { value }) => setReproduce(value)}
          spellCheck="false"
        />
        <Form.Group inline>
          <label>How much did this effect the usability of the site?</label>
          <Form.Radio
            label="I just thought you should know about it."
            value="!"
            checked={importance === "!"}
            onChange={() => handleChange("!")}
          />
          <Form.Radio
            label="It's kind of annoying."
            value="!!"
            checked={importance === "!!"}
            onChange={() => handleChange("!!")}
          />
          <Form.Radio
            label="I would hesitate using the site again because of it."
            value="!!!"
            checked={importance === "!!!"}
            onChange={() => handleChange("!!!")}
          />
          <Form.Radio
            label="It breaks something really important."
            value="!!!!"
            checked={importance === "!!!!"}
            onChange={() => handleChange("!!!!")}
          />
        </Form.Group>
        <Message
          success
          header="Issue submitted"
          content="Thank you!"
        />
        <Button
        type="submit"
        content="Send Feedback"
        className="explore"
        onClick={() => sendReport()}
      />
      </Form>
      
    </>
  );
}
