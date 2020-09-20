"use strict";

document.addEventListener("DOMContentLoaded", () => {
    class Point {
        constructor(posX, posY, onClick, onHove) {
            this.pos = {
                x: posX,
                y: posY,
            };
            this.dom = document.createElement("div");
            this.dom.style.top = posY + "px";
            this.dom.style.left = posX + "px";
            this.dom.classList.add("point");

            this.dom.onclick = () => onClick(this);
            this.dom.onmouseover = () => onHove(this);
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

    const NUMBER_OF_POINTS = 10;

    class Game {
        constructor() {
            this.state = {
                points: [],
                current: undefined,
                distance: 0,
                steps: 0,
                lost: false,
            };

            this.hallOfFame = new HallOfFame();

            // Define 'this' for the function
            this.handlePointClick = this.handlePointClick.bind(this);
            this.handlePointHove = this.handlePointHove.bind(this);

            this.hr = document.createElement("hr");
            document.body.appendChild(this.hr);

            while (this.state.points.length < NUMBER_OF_POINTS) {
                this.setNewPoint();
            }

            this.state.points[0].dom.classList.add("courant");
            this.state.current = this.state.points[0];

            this.updateScore(this.state);
        }

        setNewPoint() {
            do {
                var newPoint = Point.random(this.handlePointClick, this.handlePointHove);
            } while (
                this.state.points.some((point) => point.distanceTo(newPoint) < 20) ||
                (newPoint.pos.x <= 220 && newPoint.pos.y <= 46)
            );

            this.state.points.push(newPoint);
            document.body.insertBefore(newPoint.dom, this.hr);
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
            this.state.lost = true;
            this.hr.remove();
            alert("Game Over !");

            if (this.hallOfFame.isInTopTen({ distance: this.state.distance, steps: this.state.steps })) {
                let playerName = prompt("Congratulations, you are in the Top 10 !\nWhat's your name ?");

                if (playerName.trim().length > 0) {
                    this.hallOfFame.add({
                        name: playerName,
                        steps: this.state.steps,
                        distance: Math.floor(this.state.distance),
                    });
                }
            }

            this.hallOfFame.display();
        }

        handlePointHove(point) {
            if (this.state.lost) {
                return;
            }
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
            if (this.state.lost) {
                return;
            }
            let state = this.state;

            if (point === state.current) {
                return;
            }

            let closest = this.getClosest(state.current, state.points);

            if (point === closest) {
                state.distance += state.current.distanceTo(point);
                state.steps++;
                state.points = state.points.filter((p) => p !== state.current);
                state.current.dom.remove();
                state.current = point;
                point.dom.classList.add("courant");
                this.updateScore(state);
                this.setNewPoint();
            } else {
                point.dom.classList.add("erreur");
                closest.dom.classList.add("correct");
                this.gameOver();
            }
        }

        reset() {}
    }

    class HallOfFame {
        constructor() {
            this.topTen = [];
            let localTopTen = localStorage.getItem("topTen");
            this.topTen = localTopTen ? JSON.parse(localTopTen) : [];
            this.dom = document.createElement("div");
        }

        display() {
            this.dom.id = "highscores";

            let domTitle = document.createElement("h2");
            domTitle.textContent = "Hall Of Fame";
            this.dom.appendChild(domTitle);

            let domTable = document.createElement("table");

            let domTableHeading = document.createElement("tr");
            ["Rank", "Player", "Distance", "Steps"].forEach((e) => {
                let cell = document.createElement("th");
                cell.textContent = e;
                domTableHeading.appendChild(cell);
            });

            domTable.appendChild(domTableHeading);

            this.topTen.forEach((player, index) => {
                let tr = document.createElement("tr");

                player.rank = index + 1;

                ["rank", "name", "distance", "steps"].forEach((e, i) => {
                    let td = document.createElement("td");
                    td.textContent = player[e];
                    if (i === 2) {
                        td.textContent += "px";
                    }
                    tr.appendChild(td);
                });

                domTable.appendChild(tr);
            });

            this.dom.appendChild(domTable);

            let replay = document.createElement("button");
            replay.textContent = "Try again !";

            replay.onclick = () => {
                document.body.innerHTML = "";
                new Game();
            };

            this.dom.appendChild(replay);

            document.body.appendChild(this.dom);
        }

        isInTopTen({ distance, steps }) {
            console.log(this.topTen);
            return this.topTen.length < 10 || distance > this.topTen[9].distance;
        }

        add(playerData) {
            let i = 0;
            while (i < this.topTen.length && this.topTen[i].distance >= playerData.distance) {
                i++;
            }
            this.topTen = [...this.topTen.slice(0, i), playerData, ...this.topTen.slice(i)].slice(0, 10);
            this._save();
        }

        _save() {
            localStorage.setItem("topTen", JSON.stringify(this.topTen));
        }
    }

    new Game();
});
