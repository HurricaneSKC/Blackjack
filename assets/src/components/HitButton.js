import React from "react";
import Button from "react-bootstrap/Button";

function HitButton(props) {
  return (
    <>
      <Button 
        onClick={props.handleHitButton} 
        variant="success" 
        size="lg"
        className="game-buttons"
      >
        HIT
      </Button>
    </>
  );
}

export default HitButton;