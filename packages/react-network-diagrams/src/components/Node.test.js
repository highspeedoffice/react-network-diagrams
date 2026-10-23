/* eslint-env jest */
import { Node } from "./Node";

// Exercise the rendered handler: calling handleMouseDown directly misses the bug.
describe("Node mouse-down events", () => {
    [undefined, "Router"].forEach(label => {
        it(`forwards the event for ${label ? "labelled" : "unlabelled"} nodes`, () => {
            const calls = [];
            let propagationStopped = false;
            const event = {
                stopPropagation() {
                    propagationStopped = true;
                }
            };
            const node = new Node({
                ...Node.defaultProps,
                id: "router-1",
                x: 0,
                y: 0,
                label,
                labelStyle: { normal: {} },
                onMouseDown: (id, receivedEvent) => calls.push([id, receivedEvent])
            });

            node.render().props.onMouseDown(event);

            expect(propagationStopped).toBe(true);
            expect(calls).toHaveLength(1);
            expect(calls[0][0]).toBe("router-1");
            expect(calls[0][1]).toBe(event);
        });
    });
});
