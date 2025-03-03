import { pilots } from './pilots-data.js';

export default function Pilot({ setPilot, setGameStatus }) {

    const pilotsList = pilots.map(pilot => 
        <a href="#" 
            onClick={(e) => { e.preventDefault(); setPilot(pilot); setGameStatus(pilot.name); }} 
            className="d-block col pt-4 pb-5 hoverImgZoom" 
            key={pilot.id}>
                <img 
                    src={ pilot.avatar }
                    alt={ pilot.name } 
                    width='160' 
                    className="mb-4"
                />
                <h6 className="text-white title">{ pilot.name }</h6>
        </a>
    );

    return pilotsList;
  }