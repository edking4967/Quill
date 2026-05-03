import React, { useState, useEffect } from 'react';

export default function Timer ({ onTimeChange }) {
    const [time, setTime] = useState(0);
    const [running, setRunning] = useState(false);
    const [start, setStart] = useState(false);

    let seconds = ("0" + (Math.floor((time / 1000) % 60) % 60)).slice(-2);
    let minutes = ("0" + Math.floor((time / 60000) % 60)).slice(-2);
    let hours = ("0" + Math.floor((time / 3600000) % 99)).slice(-2);


    useEffect(() => {
        let interval = null;
        if (running) {
            interval = setInterval(() => {
                setTime(prevTime => {
                    const next = prevTime + 10;
                    if (onTimeChange) onTimeChange(Math.floor(next / 60000));
                    return next;
                });
            }, 10);
        }
        return () => clearInterval(interval);
    }, [running]);

    return (
        <div className="timer-wrapper">
            <div className="timer">
                <div className="timer-clock">{hours} : {minutes} : {seconds}</div>
                <div className="timer-buttons">
                    { !start && (
                        <button className="btn-primary timer-btn" onClick={() => {setRunning(true); setStart(true);}}>Start session</button>
                    )}
                    { start && running && (
                        <button className="btn-primary timer-btn" onClick={() => setRunning(false)}>Pause</button>

                    )}

                    { start && !running && (
                        <button className="btn-primary timer-btn" onClick={() => setRunning(true) }>Resume</button>
                    )}

                    { start && (
                        <button className="btn-primary timer-btn" onClick={() => { 
                            setRunning(false); 
                            setStart(false);
                            setTime(0); 
                            if (onTimeChange) 
                                onTimeChange(0); }}>End session
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
