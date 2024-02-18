import express from "express";
import { _readGoogleSheet, _writeGoogleSheet, _clearGoogleSheet } from "./google-sheet";

const app = express();

app.use(express.json());

app.post("/vote", async function (req, res) {
    try {
        const { id, name, party } = req.body;
    
        //check if the voter has already voted
        const data = await _readGoogleSheet("A2:C");
        if (data) {
            const voter = data.find((voter) => voter[1] === id);
            if (voter) {
                return res.send("Voted Already");
            }
        }
    
        // Add the voter to the list
        await _writeGoogleSheet("A2:C", [[name, id, party]]);
        res.send("Voted Successfully");
    } catch (error) {
        console.log(error)
        res.send("Failed to vote");
    }
});

app.get("/results", async function (req, res) {
    try {
        const data = await _readGoogleSheet("A2:C");
        const results = data?.reduce((acc, voter) => {
            const party = voter[2];
            if (acc[party]) {
                acc[party] += 1;
            } else {
                acc[party] = 1;
            }
            return acc;
        }, {} as { [key: string]: number });
    
        if (!results) {
            return res.send("No votes yet");
        }
    
        //get the winner
        const winner = Object.keys(results).reduce((acc, party) => {
            if (acc === "" || results[party] > results[acc]) {
                return party;
            }
            return acc;
        }, "");
        
        //add the winner to google sheet
        await _writeGoogleSheet("A2:C", [["Winner", `Party: ${winner}`, `Votes: ${results[winner]}`]]);
    
        res.send(results);
    } catch (error) {
        res.send("Failed to get results");
    }
});

app.get("/clear", async function (req, res) {
    try {
        await _clearGoogleSheet("A2:C");
        res.send("Cleared Successfully");
    } catch (error) {
        res.send("Failed to clear");
    }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});