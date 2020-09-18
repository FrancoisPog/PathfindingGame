"use strict";

document.addEventListener("DOMContentLoaded", () => {
    class Point {
        constructor(posX, posY, onClick, onHove) {
            this.pos = {
                x: posX,
                y: posY,
            };
            this.element = document.createElement("div");
            this.element.style.top = posY + "px";
            this.element.style.left = posX + "px";
            this.element.classList.add("point");

            this.element.onclick = () => onClick(this);
            this.element.onmouseover = () => onHove(this);
        }

        /**
         * Compute the distance between 2 points
         * @param {Point} that
         */
        distanceTo(that) {
            return Math.sqrt((that.pos.x - this.pos.x) ** 2 + (that.pos.y - this.pos.y) ** 2);
        }

        static random(onClick, onHove) {
            return new Point(
                10 + Math.random() * (window.innerWidth - 20),
                10 + Math.random() * (window.innerHeight - 20),
                onClick,
                onHove
            );
        }
    }

    const NUMBER_OF_POINTS = 100;

    class Game {
        constructor() {
            this.state = {
                points: [],
                current: undefined,
                distance: 0,
                steps: 0,
            };

            // Define 'this' for the function
            this.handlePointClick = this.handlePointClick.bind(this);
            this.handlePointHove = this.handlePointHove.bind(this);

            while (this.state.points.length < NUMBER_OF_POINTS) {
                let newPoint = Point.random(this.handlePointClick, this.handlePointHove);

                // Set the first point as current
                if (this.state.points.length === 0) {
                    newPoint.element.classList.add("courant");
                    this.state.current = newPoint;
                }

                // Check distance to other points
                if (
                    !this.state.points.some((point) => point.distanceTo(newPoint) < 20) &&
                    !(newPoint.pos.x <= 220 && newPoint.pos.y <= 46)
                ) {
                    this.state.points.push(newPoint);
                    document.body.appendChild(newPoint.element);
                }
            }

            this.hr = document.createElement("hr");
            document.body.appendChild(this.hr);

            this.updateScore(this.state);
        }

        getClosest() {
            return this.state.points
                .filter((p) => p !== this.state.current)
                .reduce((curr, p) => {
                    if (p.distanceTo(this.state.current) < curr.distanceTo(this.state.current)) {
                        return p;
                    }
                    return curr;
                });
        }

        updateScore() {
            let { steps, distance } = this.state;
            document.body.setAttribute("data-steps", steps);
            document.body.setAttribute("data-distance", Math.floor(distance));
        }

        gameOver() {
            alert("Game Over !");
            this.getPlayerInfo();
        }

        handlePointHove(point) {
            let current = this.state.current;
            let hr = this.hr;

            hr.style.width = point.distanceTo(current) + "px";
            hr.style.top = current.pos.y + "px";
            hr.style.left = current.pos.x + "px";

            let dx = current.pos.x - point.pos.x;
            let dy = current.pos.y - point.pos.y;
            let angle = Math.atan(dy / dx);
            if (current.pos.x > point.pos.x) {
                angle += Math.PI;
            }

            hr.style.transform = `rotate(${angle}rad)`;
        }

        handlePointClick(point) {
            let state = this.state;

            if (point === state.current) {
                return;
            }

            let closest = this.getClosest(state.current, state.points);

            if (point === closest) {
                state.distance += state.current.distanceTo(point);
                state.steps++;
                state.points = state.points.filter((p) => p !== state.current);
                state.current.element.remove();
                state.current = point;
                point.element.classList.add("courant");
                this.updateScore(state);
            } else {
                point.element.classList.add("erreur");
                closest.element.classList.add("correct");
                this.gameOver();
            }
        }

        win() {
            alert("Win");
            getPlayerInfo();
        }

        getPlayerInfo() {
            let player = prompt("Your name : ");
        }
    }

    let game = new Game();
});
