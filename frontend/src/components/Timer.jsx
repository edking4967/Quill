export default function Timer () {
    const [time, setTime] = useState(0);  
    const [start, setStart] = useState(false);

    let seconds = ("0" + (Math.floor((time / 1000) % 60) % 60)).slice(-2);
    let minutes = ("0" + Math.floor((time / 60000) % 60)).slice(-2);
    let hours = ("0" + Math.floor((time / 3600000) % 60)).slice(-2);

    useEffect(() => {

        let interval = null;

        if (start) {

            interval = setInterval(() => {

                if (time > 0) {

                    setTime(prevTime => prevTime - 10)
                }

            }, 10)

        } else {
            clearInterval(interval);
        }

        return () => {
            clearInterval(interval)
        }

    }, [start])

    function adjustTimer(input) {

        if (!start) {

            switch (input) {

                case "incHours":
                    setTime(prevTime => prevTime + 3600000)
                    break;

                case "incMinutes":
                    setTime(prevTime => prevTime + 60000)
                    break;

                case "incSeconds":
                    setTime(prevTime => prevTime + 1000)
                    break;

                case "decHours":
                    setTime(prevTime => prevTime - 3600000)

                case "decMinutes":
                    setTime(prevTime => prevTime - 60000)
                    break;

                case "decSeconds":
                    setTime(prevTime => prevTime - 1000)
                    break;

                default:
                    break;
            }

        }

    }

    return (

        <div className="App">

            <button onClick={() => adjustTimer("incHours")}>&#8679;</button>

            <button onClick={() => adjustTimer("incMinutes")}>&#8679;</button>

            <button onClick={() => adjustTimer("incSeconds")}>&#8679;</button>

            <div>{hours} : {minutes} : {seconds}</div>

            <button onClick={() => adjustTimer("decHours")}>&#8681;</button>

            <button onClick={() => adjustTimer("decMinutes")}>&#8681;</button>

            <button onClick={() => adjustTimer("decSeconds")}>&#8681;</button> <br/><br/>

            <button onClick={() => setStart(true)}>Start</button>

            <button onClick={() => setStart(false)}>Stop</button>

            <button onClick={() => {setStart(false); setTime(0)}}>Reset</button>

        </div>

    );
}
