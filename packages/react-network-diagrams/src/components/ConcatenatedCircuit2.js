/**
 *  Copyright (c) 2018, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import React from "react";
import _ from "underscore";
import PropTypes from "prop-types";

import { Connection } from "./Connection";
import { Endpoint } from "./Endpoint";
import { Node } from "./Node";
import { Navigate } from "./Navigate";
import { Directions } from "../js/constants";
import {hierarchy, tree} from "d3-hierarchy";

/**
 * Draw a Concatenated circuit
 *
 * This component determines the (x1, y1), (x2, y2) coordinates on the page
 * and then renders a group of circuits by combining the
 * connection and endpoint props. Connection shape, style, and label information,
 * are passed in as props.
 *
 * This is of the form:
 *     [endpoint, connection, endpoint, connection, endpoint, ...]
 */
export class ConcatenatedCircuit2 extends React.Component {
    renderCircuitTitle(title) {
        const titleStyle = {
            textAnchor: "left",
            fill: "#9D9D9D",
            fontFamily: "verdana, sans-serif",
            fontSize: 14
        };

        if (!this.props.hideTitle) {
            return (
                <text
                    className="circuit-title"
                    key="circuit-title"
                    style={titleStyle}
                    x={this.props.titleOffsetX}
                    y={this.props.titleOffsetY}
                >
                    {title}
                </text>
            );
        } else {
            return null;
        }
    }

    renderParentNavigation(parentId) {
        if (parentId) {
            return (
                <g>
                    <Navigate
                        direction={Directions.NORTH}
                        ypos={0}
                        width={this.props.width}
                        height={this.props.height}
                        id={this.props.parentId}
                        onSelectionChange={this.props.onSelectionChange}
                    />
                </g>
            );
        } else {
            return null;
        }
    }

    renderDisabledOverlay(disabled) {
        const style = { fill: "#FDFDFD", fillOpacity: 0.65 };
        if (disabled) {
            return (
                <rect
                    className="circuit-overlay"
                    style={style}
                    x="0"
                    y="0"
                    width={this.props.width}
                    height={this.props.height}
                />
            );
        } else {
            return null;
        }
    }



    renderCircuitElements() {
        const elements = [];

        // Determine the initial position
        const memberList = this.props.memberList;

        // d3 layout to get co-ordinates
        var treemap = tree()
            .size([(this.props.height - (this.props.margin*2)), (this.props.width - (this.props.margin*2))]);

        var nodes = hierarchy(memberList, function(d) {
            return d.children;
        });
        nodes = treemap(nodes);
        //
        // Since squares may be a different width than other connections, and may appear
        // at different positions inside the concatenation, we need to determine
        // the total combined squareWidth of all the square connectors, then subtract that
        // from the total available width.  The remaining length divided by the number
        // of non-square segments is how long the remaining non-square segments can be
        //

        const memberCount = memberList.length;
        let squareMemberCount = 0;

        const totalWidth = this.props.width - this.props.margin * 2;
        let totalSquareWidth = 0;

        _.each(memberList, member => {
            if (_.has(member.styleProperties, "squareWidth")) {
                totalSquareWidth += member.styleProperties.squareWidth;
                squareMemberCount += 1;
            }
        });

        const lineWidth = (totalWidth - totalSquareWidth) / (memberCount - squareMemberCount);

        _.each(nodes.descendants(), (member, idx) => {
            let x = member.y + this.props.margin;
            let y = member.x + this.props.margin;

            if(member.data.styleProperties.lineShape !== "linear") {
                let midX = ((member.y - member.parent.y)/2)+member.parent.y;
                if(member.parent.parent === null) {
                    midX = 0;
                }
                x = (midX + (member.data.styleProperties.squareWidth / 2)) + this.props.margin;
            }
            else {
                if (member.parent === null) {
                    x = this.props.margin;
                } else {
                    _.each(member.children, child => {
                        if (child.data.styleProperties.lineShape !== "linear") {
                            let midX = ((child.y - member.y) / 2) + member.y;
                            x = (midX - (child.data.styleProperties.squareWidth / 2)) + this.props.margin;
                        }
                    });
                }
            }
            elements.push(
                <Endpoint
                    x={x}
                    y={member.x + this.props.margin}
                    key={"endpoint-" + idx}
                    style={member.data.endpointStyle}
                    labelPosition={this.props.endpointLabelPosition}
                    offset={this.props.endpointLabelOffset}
                    label={member.data.endpointLabelZ}
                />
            );
        });

        _.each(nodes.descendants().slice(1), (member, idx) => {
            const roundedX = member.data.styleProperties.roundedX || this.props.roundedX;
            const roundedY = member.data.styleProperties.roundedY || this.props.roundedY;
            if(member.data.styleProperties.lineShape !== "linear") {
                let midX = ((member.y - member.parent.y)/2)+member.parent.y;
                if(member.parent.parent === null) {
                    midX = 0;
                }
                if(member.data.styleProperties.lineShape === "cloud") {
                    elements.push(
                        <Node
                            shape={"cloud"}
                            x={(midX - (member.data.styleProperties.squareWidth / 2)) + this.props.margin}
                            y={member.parent.x + this.props.margin}
                            style={member.data.styleProperties.style.node}
                            lineShape={member.data.styleProperties.lineShape}
                            labelStyle={member.data.styleProperties.style.label}
                            key={"circuit-" + idx}
                            roundedX={roundedX}
                            roundedY={roundedY}
                            label={member.data.circuitLabel}
                            labelPosition={this.props.connectionLabelPosition}
                            labelOffsetY={this.props.yOffset}
                        />
                    );
                }
                else {
                    elements.push(
                        <Connection
                            x1={(midX - (member.data.styleProperties.squareWidth / 2)) + this.props.margin}
                            x2={(midX + (member.data.styleProperties.squareWidth / 2)) + this.props.margin}
                            y1={member.parent.x + this.props.margin}
                            y2={member.x + this.props.margin}
                            key={"circuit-" + idx}
                            roundedX={roundedX}
                            roundedY={roundedY}
                            style={member.data.styleProperties.style}
                            lineShape={member.data.styleProperties.lineShape}
                            label={member.data.circuitLabel}
                            labelPosition={this.props.connectionLabelPosition}
                            labelOffsetY={this.props.yOffset}
                            noNavigate={member.data.styleProperties.noNavigate}
                            navTo={member.data.navTo}
                            size={member.data.styleProperties.size}
                            centerLine={member.data.styleProperties.centerLine}
                            onSelectionChange={this.props.onSelectionChange}
                        />
                    );
                }
            }
            else {
                console.log(this.props.margin);
                console.log(member);
                let x1 = member.parent.y + this.props.margin;
                let x2 = member.y + this.props.margin;
                let y1 = member.parent.x + this.props.margin;
                let y2 = member.x + this.props.margin;
                if(member.parent.data.styleProperties.lineShape !== "linear") {
                    let midX = ((member.parent.y - member.parent.parent.y)/2)+member.parent.parent.y;
                    if(member.parent.parent.parent === null) {
                        midX = 0;
                    }
                    x1 = (midX + (member.parent.data.styleProperties.squareWidth/2)) + this.props.margin;
                }
                _.each(member.children, child => {
                    if(child.data.styleProperties.lineShape !== "linear") {
                        let midX = ((child.y - member.y)/2)+member.y;
                        x2 = (midX + (child.data.styleProperties.squareWidth/2)) + this.props.margin;
                    }
                });
                if(member.data.styleProperties.lineShape === "cloud") {
                    elements.push(
                        <Node
                            shape={"cloud"}
                            x={x1}
                            y={y1}
                            style={member.data.styleProperties.style}
                        />
                    );
                }
                else {
                    elements.push(
                        <Connection
                            x1={x1}
                            x2={x2}
                            y1={y1}
                            y2={y2}
                            key={"circuit-" + idx}
                            roundedX={roundedX}
                            roundedY={roundedY}
                            style={member.data.styleProperties.style}
                            lineShape={member.data.styleProperties.lineShape}
                            label={member.data.circuitLabel}
                            labelPosition={this.props.connectionLabelPosition}
                            labelOffsetY={this.props.yOffset}
                            noNavigate={member.data.styleProperties.noNavigate}
                            navTo={member.data.navTo}
                            size={member.data.styleProperties.size}
                            centerLine={member.data.styleProperties.centerLine}
                            onSelectionChange={this.props.onSelectionChange}
                        />
                    );
                }
            }
        });

        // Draw the first endpoint

        /* since the Z of each member is shared with the A of the next member, render only
         * the Z for each member starting with the first member
         */

/*        _.each(memberList, (member, memberIndex) => {
            if (member.styleProperties.lineShape === "square") {
                x2 = x1 + member.styleProperties.squareWidth;
            } else {
                x2 = x1 + lineWidth;
            }
            elements.push(
                <Endpoint
                    x={x2}
                    y={y2}
                    key={"endpoint-" + (memberIndex + 1)}
                    style={member.endpointStyle}
                    labelPosition={this.props.endpointLabelPosition}
                    offset={this.props.endpointLabelOffset}
                    label={member.endpointLabelZ}
                />
            );
            x1 = x2;
        });

        // reset x1
        x1 = this.props.margin;

        // Collect all the connections

        _.each(memberList, (member, memberIndex) => {
            const roundedX = member.styleProperties.roundedX || this.props.roundedX;
            const roundedY = member.styleProperties.roundedY || this.props.roundedY;

            if (member.styleProperties.lineShape === "square") {
                x2 = x1 + member.styleProperties.squareWidth;
            } else {
                x2 = x1 + lineWidth;
            }
            elements.push(
                <Connection
                    x1={x1}
                    x2={x2}
                    y1={y1}
                    y2={y2}
                    key={"circuit-" + memberIndex}
                    roundedX={roundedX}
                    roundedY={roundedY}
                    style={member.styleProperties.style}
                    lineShape={member.styleProperties.lineShape}
                    label={member.circuitLabel}
                    labelPosition={this.props.connectionLabelPosition}
                    labelOffsetY={this.props.yOffset}
                    noNavigate={member.styleProperties.noNavigate}
                    navTo={member.navTo}
                    size={member.styleProperties.size}
                    centerLine={member.styleProperties.centerLine}
                    onSelectionChange={this.props.onSelectionChange}
                />
            );
            x1 = x2;
        });*/
        return <g>{elements}</g>;
    }

    render() {
        const circuitContainer = {
            normal: {
                borderTopStyle: "solid",
                borderBottomStyle: "solid",
                borderWidth: 1,
                borderTopColor: "#FFFFFF",
                borderBottomColor: "#EFEFEF",
                width: "100%",
                height: this.props.height
            },
            disabled: {
                width: "100%",
                height: this.props.height
            }
        };

        let className = "circuit-container";
        let svgStyle;

        if (this.props.disabled) {
            className += " disabled";
            svgStyle = circuitContainer.disabled;
        } else {
            svgStyle = circuitContainer.normal;
        }

        return (
            <svg className={className} style={svgStyle} onClick={this._deselect}>
                {this.renderCircuitTitle(this.props.title)}
                {this.renderCircuitElements()}
                {this.renderParentNavigation(this.props.parentId)}
                {this.renderDisabledOverlay(this.props.disabled)}
            </svg>
        );
    }
}

ConcatenatedCircuit2.propTypes = {
    /** The width of the circuit diagram */
    width: PropTypes.number,

    /** The height of the circuit diagram */
    height: PropTypes.number,

    /** The position of the title relative to the left side of the diagram */
    titleOffsetX: PropTypes.number,

    /** The position of the title relative to the top of the diagram */
    titleOffsetY: PropTypes.number,

    /** The blank margin around the diagram drawing */
    margin: PropTypes.number,

    /**
     * Controls shape of the line, can be "linear", "square", "angled", "arc".
     */
    lineShape: PropTypes.oneOf(["linear", "square", "angled", "arc"]),

    /**
     * To accurately display each of the member circuits, the concatenated circuit
     * requires an ordered array of circuit objects, where each object contains
     * the props to be used by the lower level connection and endpoint primitives.
     * Since the list renders sequentially, it assumes that the member circuits are in order. The list can be any length and needs to be constructed as such:
     *
     * ```
     * const memberList = [
     *     {
     *         styleProperties: darkFiberStyle,
     *         endpointStyle: stylesMap.endpoint,
     *         endpointLabelA: "Endpoint 1",
     *         endpointLabelZ: "Endpoint 2",
     *         circuitLabel: "Member 1",
     *         navTo: "Member 1"
     *     }, {
     *         styleProperties: couplerStyle,
     *         endpointStyle: stylesMap.endpoint,
     *         endpointLabelA: "Endpoint 2",
     *         endpointLabelZ: "Endpoint 3",
     *         circuitLabel: "Member 2",
     *         navTo: "Member 2"
     *     }, {
     *         styleProperties: leasedStyle,
     *         endpointStyle: stylesMap.endpoint,
     *         endpointLabelA: "Endpoint 3",
     *         endpointLabelZ: "Endpoint 4",
     *         circuitLabel: "Member 3",
     *         navTo: "Member 3"
     *     }
     * ];
     * ```
     */
    memberList: PropTypes.array.isRequired,

    /**
     * Described the position of the connection label; accepts **"top"**, **"center"**, or **"bottom"**
     */
    connectionLabelPosition: PropTypes.oneOf(["top", "center", "bottom"]),

    /**
     * The position of the label around the endpoint.
     */
    endpointLabelPosition: PropTypes.oneOf([
        "left",
        "right",
        "top",
        "topright",
        "topleft",
        "bottom",
        "bottomright",
        "bottomleft",
        "bottomleftangled",
        "bottomrightangled",
        "topleftangled",
        "toprightangled"
    ]),

    /**
     * This is the vertical distance from the center line to offset
     * the connection label.
     */
    yOffset: PropTypes.number,

    /**
     * This is the distance from the endpoint that the endpoint
     * label will be rendered.
     */
    endpointLabelOffset: PropTypes.number,

    /**
     * The string to display in the top left corner of the diagram
     */
    title: PropTypes.string,

    /**
     * Value that determines whether or not the upper left corner title is displayed
     */
    hideTitle: PropTypes.bool,

    /**
     * Determines if the circuit view is muted.  Typically used in
     * conjunction with `parentID`
     */
    disabled: PropTypes.bool,

    /**
     * Callback function used to handle clicks.
     */
    onSelectionChange: PropTypes.func,

    /**
     * Value that if provided, will render a small nav arrow that
     * when clicked, navigates to that element. Used mainly when we want
     * to show a parent / child relationship between two circuits.
     */
    parentId: PropTypes.oneOfType([PropTypes.string, PropTypes.Number]),

    /**
     * Boolean value that determines if the element uses the onSelectionChange
     * change and can be clicked
     */
    noNavigate: PropTypes.bool,

    /**
     * This value is used to determine X coordinates for a square, if you want
     * the square to be smaller than the default line width. Overrides the
     * margin prop if a square is displayed
     */
    squareWidth: PropTypes.number,

    /** When the endpoint shape is a `square`, this controls the radius of corners. */
    roundedX: PropTypes.number,

    /** When the endpoint shape is a `square`, this controls the radius of corners. */
    roundedY: PropTypes.number
};

ConcatenatedCircuit2.defaultProps = {
    width: 851,
    height: 250,
    disabled: false,
    titleOffsetX: 10,
    titleOffsetY: 15,
    margin: 100,
    noNavigate: false,
    squareWidth: 25,
    roundedX: 5,
    roundedY: 5
};
