import React, { Component } from 'react';
import Slider from 'rc-slider';
import './App.css';

class App extends Component {
  originX = 300;
  originY = 300;

  constructor(props) {
    super(props);

    const femur = {
      angle: 0,
      len: 100,
      ...this.calculatPositionFromOrigin(0, 100, this.originX, this.originY),
    };

    const tibia = {
      angle: 0,
      len: 100,
      ...this.calculatPositionFromOrigin(0, 100, femur.dx, femur.dy),
    };

    this.state = {
      femur,
      tibia,
    };
  }

  toDegrees (angle) {
    return angle * (180 / Math.PI);
  }

  toRadians (angle) {
    return angle * (Math.PI / 180);
  }

  calculatPositionFromOrigin = (angle, len, originX, originY) => {
    const { x, y } = this.calculatePosition(angle, len);

    return {
      x: originX,
      y: originY,
      dx: originX + x,
      dy: originY + y,
    };
  };

  calculatePosition = (angle, len) => {
    const angleRad = this.toRadians(angle);
    const x = Math.cos(angleRad) * len;
    const y = Math.sin(angleRad) * len;

    return {
      x,
      y,
    };
  };

  calculateAnglesFromPosition = (offsetX, offsetY) => {
    const { femur, tibia } = this.state;

    console.log('x', offsetX, 'y', offsetY);

    const a = Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2));

    console.log('a', a);

    const f = this.toDegrees(Math.asin(((Math.sin(this.toRadians(90)) * offsetY)) / a));

    console.log('f', f);

    const k = this.toDegrees(Math.acos((Math.pow(femur.len, 2) + Math.pow(tibia.len, 2) - Math.pow(a, 2)) / (2 * femur.len * tibia.len)));

    console.log('k', k);

    if (isNaN(k)) {
      return {
        femur: 0,
        tibia: 0,
      };
    }

    const femurAngle = (((180 - k) / 2) - f) * -1;
    
    console.log('femur', femurAngle);

    const tibiaAngle = (180 - k) + femurAngle;

    console.log('tibia', tibiaAngle);

    return {
      femur: femurAngle,
      tibia: tibiaAngle,
    };
  };

  onFemurChange = (newAngle) => this.setJointAngles(newAngle, this.state.tibia.angle - this.state.femur.angle + newAngle);

  onTibiaChange = (newAngle) => this.setJointAngles(this.state.femur.angle, newAngle);

  onDistanceChange = (newDistance) => {
    const { femur, tibia } = this.state;
    console.log('start', femur.angle, tibia.angle, tibia.dx, newDistance);
    const angles = this.calculateAnglesFromPosition(Math.abs(newDistance - this.originX), Math.abs(tibia.dy - this.originY));

    this.setJointAngles(angles.femur, angles.tibia);
  };

  onHeightChange = (newHeight) => {
    const { femur, tibia } = this.state;
    console.log('start', femur.angle, tibia.angle, tibia.dy, newHeight);
    const angles = this.calculateAnglesFromPosition(Math.abs(tibia.dx - this.originX), Math.abs(newHeight - this.originY));

    this.setJointAngles(angles.femur, angles.tibia);
  };

  setJointAngles = (femurAngle, tibiaAngle) => {
    const { femur, tibia } = this.state;

    console.log('Prev femur', femur.x, femur.y, femur.dx, femur.dy);
    console.log('Prev tibia', tibia.x, tibia.y, tibia.dx, tibia.dy);

    const nextFemur = {
      ...femur,
      ...this.calculatPositionFromOrigin(femurAngle, femur.len, this.originX, this.originY),
      angle: femurAngle,
    };
    const nextTibia = {
      ...tibia,
      ...this.calculatPositionFromOrigin(tibiaAngle, tibia.len, nextFemur.dx, nextFemur.dy),
      angle: tibiaAngle,
    };
    console.log('Next femur', nextFemur.x, nextFemur.y, nextFemur.dx, nextFemur.dy);
    console.log('Next tibia', nextTibia.x, nextTibia.y, nextTibia.dx, nextTibia.dy);

    this.setState({
      femur: nextFemur,
      tibia: nextTibia,
    });
  };

  setPositionReset = () => this.setJointAngles(-15, 63);

  setPositionRest = () => this.setJointAngles(-65, 130);

  setPositionStand = () => this.setJointAngles(-15, 90);

  render() {
    const { femur, tibia } = this.state;

    return (
      <div className="App">
        <svg className="canvas" viewBox="0 0 600 600">
          <rect x={0} y={this.originY} width="2000" height="2000" className="ground" />
          <circle cx={this.originX} cy={this.originY} r="10" className="origin" />
          <line x1={femur.x} y1={femur.y} x2={femur.dx} y2={femur.dy} className="femur" />
          <line x1={tibia.x} y1={tibia.y} x2={tibia.dx} y2={tibia.dy} className="tibia" />
        </svg>

        <div className="controls">
          <h2>Femur</h2>
          <Slider value={femur.angle} min={-360} max={360}
            onChange={this.onFemurChange}
          />
          <h2>Tibia</h2>
          <Slider value={tibia.angle} min={-360} max={360}
            onChange={this.onTibiaChange}
          />

          <div className="heightControls">
            <div>
              <h2>Foot height</h2>
              <Slider value={tibia.dy} min={0} max={this.originY * 2} vertical
                onChange={this.onHeightChange}
              />
            </div>
            <div>
              <h2>Foot distance</h2>
              <Slider value={tibia.dx} min={0} max={this.originX * 2} vertical
                onChange={this.onDistanceChange}
              />
            </div>
          </div>

          <div>
            <button onClick={this.setPositionRest}>Rest</button>
            <button onClick={this.setPositionStand}>Stand</button>
            <button onClick={this.setPositionReset}>Reset</button>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
