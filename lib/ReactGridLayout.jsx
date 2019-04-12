// @flow
import React, { useState, useEffect } from "react";
import {useLogger, useWindowSize, useMount} from 'react-use';

import PropTypes from "prop-types";
import isEqual from "lodash.isequal";
import classNames from "classnames";
import {
  autoBindHandlers,
  bottom,
  childrenEqual,
  cloneLayoutItem,
  compact,
  getLayoutItem,
  moveElement,
  synchronizeLayoutWithChildren,
  validateLayout,
  getAllCollisions,
  noop
} from "./utils";
import GridItem from "./GridItem";
import type {
  ChildrenArray as ReactChildrenArray,
  Element as ReactElement
} from "react";

// Types
import type {
  EventCallback,
  CompactType,
  GridResizeEvent,
  GridDragEvent,
  Layout,
  LayoutItem
} from "./utils";

export type Props = {
  className: string,
  style: Object,
  width: number,
  autoSize: boolean,
  cols: number,
  draggableCancel: string,
  draggableHandle: string,
  verticalCompact: boolean,
  compactType: ?("horizontal" | "vertical"),
  layout: Layout,
  margin: [number, number],
  containerPadding: [number, number] | null,
  rowHeight: number,
  maxRows: number,
  isDraggable: boolean,
  isResizable: boolean,
  preventCollision: boolean,
  useCSSTransforms: boolean,

  // Callbacks
  onLayoutChange: Layout => void,
  onDrag: EventCallback,
  onDragStart: EventCallback,
  onDragStop: EventCallback,
  onResize: EventCallback,
  onResizeStart: EventCallback,
  onResizeStop: EventCallback,
  children: ReactChildrenArray<ReactElement<any>>
};
// End Types

function ReactGridLayout(props) {

  const {
    children,
    autoSize = true,
    cols = 12,
    className = "",
    style = {},
    draggableHandle ="",
    draggableCancel = "",
    containerPadding = null,
    rowHeight = 150,
    maxRows = Infinity, // infinite vertical growth
    compactType = "vertical",
    // layout = [],
    margin = [10, 10],
    isDraggable = true,
    isResizable = true,
    useCSSTransforms = true,
    verticalCompact = true,
    preventCollision = false,
    onLayoutChange = noop,
    // onDragStart = noop,
    // onDrag = noop,
    // onDragStop = noop,
    // onResizeStart = noop,
    // onResize = noop,
    // onResizeStop = noop
  } = props;

  useLogger('Demo', props);
  const {width, height} = useWindowSize();
  const [oldLayout, setOldLayout] = useState([]);
  const [oldResizeItem, setOldResizeItem] = useState(null);
  const [children, setChildren] = useState(null);
  const [compactType, setCompactType] = useState('vertical');
  const [activeDrag, setActiveDrag] = useState(null);
  const [oldDragItem, setOldDragItem] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [layout, setLayout] = useState(
    synchronizeLayoutWithChildren(
      props.layout,
      props.children,
      props.cols,
      // Legacy support for verticalCompact = false
      compactType()
    ),
  );

  // useEffect(() => {
  useMount(() => {
    console.log('MOUNTED');
    setMounted(true);
    // setState({ mounted: true });
    // Possibly call back with layout on mount. This should be done after correcting the layout width
    // to ensure we don't rerender with the wrong width.
    onLayoutMaybeChanged(layout, props.layout);
  });

  const onLayoutMaybeChanged = (newLayout: Layout, oldLayout: ?Layout) => {
    if (!oldLayout) {
      oldLayout = layout;
    }
    if (!isEqual(oldLayout, newLayout)) {
      props.onLayoutChange(newLayout);
    }
  }

  const containerHeight = () => {
    if (!this.props.autoSize) return;
    const nbRow = bottom(this.state.layout);
    const containerPaddingY = this.props.containerPadding
      ? this.props.containerPadding[1]
      : this.props.margin[1];
    return (
      nbRow * this.props.rowHeight +
      (nbRow - 1) * this.props.margin[1] +
      containerPaddingY * 2 +
      "px"
    );
  }

  const compactType: CompactType = (props: ?Object) => {
    if (!props) {
      props = this.props;
    }
    return props.verticalCompact === false
      ? null
      : props.compactType;
  }

  const onDragStart = (i: string, x: number, y: number, { e, node }: GridDragEvent) => {
    const { layout } = state;
    var l = getLayoutItem(layout, i);
    if (!l) return;

    setState({
      oldDragItem: cloneLayoutItem(l),
      oldLayout: state.layout
    });

    return onDragStart(layout, l, l, null, e, node);
  };

  const onDrag = (i: string, x: number, y: number, { e, node }: GridDragEvent) => {
    const { oldDragItem } = state;
    let { layout } = state;
    var l = getLayoutItem(layout, i);
    if (!l) return;

    // Create placeholder (display only)
    var placeholder = {
      w: l.w,
      h: l.h,
      x: l.x,
      y: l.y,
      placeholder: true,
      i: i
    };

    // Move the element to the dragged location.
    const isUserAction = true;
    layout = moveElement(
      layout,
      l,
      x,
      y,
      isUserAction,
      preventCollision,
      compactType(),
      cols,
    );

    onDrag(layout, oldDragItem, l, placeholder, e, node);

    setState({
      layout: compact(layout, compactType(), cols),
      activeDrag: placeholder
    });
  }

  const onDragStop = (i: string, x: number, y: number, { e, node }: GridDragEvent) => {
    const { oldDragItem } = state;
    let { layout } = state;
    const l = getLayoutItem(layout, i);
    if (!l) return;

    // Move the element here
    const isUserAction = true;
    layout = moveElement(
      layout,
      l,
      x,
      y,
      isUserAction,
      preventCollision,
      compactType(),
      cols
    );

    onDragStop(layout, oldDragItem, l, null, e, node);

    // Set state
    const newLayout = compact(layout, compactType(), cols);
    const { oldLayout } = state;
    setState({
      activeDrag: null,
      layout: newLayout,
      oldDragItem: null,
      oldLayout: null
    });

    onLayoutMaybeChanged(newLayout, oldLayout);
  }

  const onResizeStart= (i: string, w: number, h: number, { e, node }: GridResizeEvent) =>  {
    const { layout } = this.state;
    var l = getLayoutItem(layout, i);
    if (!l) return;

    setOldResizeItem(cloneLayoutItem(l))
    setOldLayout(layout)

    props.onResizeStart(layout, l, l, null, e, node);
  }

  const onResize = (i: string, w: number, h: number, { e, node }: GridResizeEvent) => {
    const { layout, oldResizeItem } = this.state;
    const { cols, preventCollision } = this.props;
    const l: ?LayoutItem = getLayoutItem(layout, i);
    if (!l) return;

    // Something like quad tree should be used
    // to find collisions faster
    let hasCollisions;
    if (preventCollision) {
      const collisions = getAllCollisions(layout, { ...l, w, h }).filter(
        layoutItem => layoutItem.i !== l.i
      );
      hasCollisions = collisions.length > 0;

      // If we're colliding, we need adjust the placeholder.
      if (hasCollisions) {
        // adjust w && h to maximum allowed space
        let leastX = Infinity,
          leastY = Infinity;
        collisions.forEach(layoutItem => {
          if (layoutItem.x > l.x) leastX = Math.min(leastX, layoutItem.x);
          if (layoutItem.y > l.y) leastY = Math.min(leastY, layoutItem.y);
        });

        if (Number.isFinite(leastX)) l.w = leastX - l.x;
        if (Number.isFinite(leastY)) l.h = leastY - l.y;
      }
    }

    if (!hasCollisions) {
      // Set new width and height.
      l.w = w;
      l.h = h;
    }

    // Create placeholder element (display only)
    var placeholder = {
      w = l.w,
      h = l.h,
      x = l.x,
      y = l.y,
      static = true,
      i = i
    };

    props.onResize(layout, oldResizeItem, l, placeholder, e, node);

    // Re-compact the layout and set the drag placeholder.
    setLayout(compact(layout, this.compactType(), cols));
    setActiveDrag(placeholder);
  }

  const onResizeStop = (i: string, w: number, h: number, { e, node }: GridResizeEvent) => {
    const { layout, oldResizeItem } = this.state;
    const { cols } = this.props;
    var l = getLayoutItem(layout, i);

    props.onResizeStop(layout, oldResizeItem, l, null, e, node);

    // Set state
    const newLayout = compact(layout, compactType(), cols);
    const oldLayout = layout;

    setLayout(newLayout)
    setActiveDrag(null)
    setOldLayout(null)
    setOldResizeItem(null)

    onLayoutMaybeChanged(newLayout, oldLayout);
  }

  const placeholder: ?ReactElement<any> = () => {
    if (!activeDrag) return null;
    const {
      width,
      cols,
      margin,
      containerPadding,
      rowHeight,
      maxRows,
      useCSSTransforms
    } = props;

    // {...this.state.activeDrag} is pretty slow, actually
    return (
      <GridItem
        w={activeDrag.w}
        h={activeDrag.h}
        x={activeDrag.x}
        y={activeDrag.y}
        i={activeDrag.i}
        className="react-grid-placeholder"
        containerWidth={width}
        cols={cols}
        margin={margin}
        containerPadding={containerPadding || margin}
        maxRows={maxRows}
        rowHeight={rowHeight}
        isDraggable={false}
        isResizable={false}
        useCSSTransforms={useCSSTransforms}
      >
        <div />
      </GridItem>
    );
  }

  const processGridItem: ?ReactElement<any> = (child: ReactElement<any>) => {
    if (!child || !child.key) return;
    const layoutItem = getLayoutItem(layout, String(child.key));
    if (!layoutItem) return null;
    const {
      width,
      cols,
      margin,
      containerPadding,
      rowHeight,
      maxRows,
      isDraggable,
      isResizable,
      useCSSTransforms,
      draggableCancel,
      draggableHandle
    } = this.props;
    const { mounted } = this.state;

    // Parse 'static'. Any properties defined directly on the grid item will take precedence.
    const draggable = Boolean(
      !layoutItem.static && isDraggable && (layoutItem.isDraggable || layoutItem.isDraggable == null)
    );
    const resizable = Boolean(
      !layoutItem.static && isResizable && (layoutItem.isResizable || layoutItem.isResizable == null)
    );

    return (
      <GridItem
        containerWidth={width}
        cols={cols}
        margin={margin}
        containerPadding={containerPadding || margin}
        maxRows={maxRows}
        rowHeight={rowHeight}
        cancel={draggableCancel}
        handle={draggableHandle}
        onDragStop={this.onDragStop}
        onDragStart={this.onDragStart}
        onDrag={this.onDrag}
        onResizeStart={this.onResizeStart}
        onResize={this.onResize}
        onResizeStop={this.onResizeStop}
        isDraggable={draggable}
        isResizable={resizable}
        useCSSTransforms={useCSSTransforms && mounted}
        usePercentages={!mounted}
        w={layoutItem.w}
        h={layoutItem.h}
        x={layoutItem.x}
        y={layoutItem.y}
        i={layoutItem.i}
        minH={layoutItem.minH}
        minW={layoutItem.minW}
        maxH={layoutItem.maxH}
        maxW={layoutItem.maxW}
        static={layoutItem.static}
      >
        {child}
      </GridItem>
    );
  }

  const hasUpdatedChildren = !childrenEqual(children, props.children)
  if (hasUpdatedChildren) {
    setChildren(props.children)
  }

  const newLayoutBase = {
    [true]: undefined,
    [!isEqual(props.layout, layout) || (props.compactType !== compactType)]: props.layout,
    [hasUpdatedChildren]: layout,
  }.true;

  // We need to regenerate the layout.
  if (newLayoutBase) {
    const newLayout = synchronizeLayoutWithChildren(
      newLayoutBase,
      props.children,
      props.cols,
      compactType(props)
    );
    setLayout(newLayout);
    onLayoutMaybeChanged(newLayout, layout);
  }

  const mergedClassName = classNames("react-grid-layout", className);
  const mergedStyle = {
    height: this.containerHeight(),
    ...style
  };

  return (
    <div className={mergedClassName} style={mergedStyle}>
      {React.Children.map(children, child =>
        this.processGridItem(child)
      )}
      {this.placeholder()}
    </div>
  );
}

ReactGridLayout.displayName = "ReactGridLayout";

ReactGridLayout.propTypes = {
  //
  // Basic props
  //
  className: PropTypes.string,
  style: PropTypes.object,

  // This can be set explicitly. If it is not set, it will automatically
  // be set to the container width. Note that resizes will *not* cause this to adjust.
  // If you need that behavior, use WidthProvider.
  width:  PropTypes.number,

  // If true, the container height swells and contracts to fit contents
  autoSize:  PropTypes.bool,
  // # of cols.
  cols: PropTypes.number,

  // A selector that will not be draggable.
  draggableCancel:  PropTypes.string,
  // A selector for the draggable handler
  draggableHandle:  PropTypes.string,

  // Deprecated
  verticalCompact:  function(props = Props) {
    if (
      props.verticalCompact === false &&
      process.env.NODE_ENV !== "production"
    ) {
      console.warn(
        // eslint-disable-line no-console
        "`verticalCompact` on <ReactGridLayout> is deprecated and will be removed soon. " +
          'Use `compactType` = "horizontal" | "vertical" | null.'
      );
    }
  },
  // Choose vertical or hotizontal compaction
  compactType:  PropTypes.oneOf(["vertical", "horizontal"]),

  // layout is an array of object with the format:
  // {x = Number, y = Number, w = Number, h = Number, i = String}
  layout:  function(props = Props) {
    var layout = props.layout;
    // I hope you're setting the data-grid property on the grid items
    if (layout === undefined) return;
    validateLayout(layout, "layout");
  },

  //
  // Grid Dimensions
  //

  // Margin between items [x, y] in px
  margin:  PropTypes.arrayOf(PropTypes.number),
  // Padding inside the container [x, y] in px
  containerPadding:  PropTypes.arrayOf(PropTypes.number),
  // Rows have a static height, but you can change this based on breakpoints if you like
  rowHeight:  PropTypes.number,
  // Default Infinity, but you can specify a max here if you like.
  // Note that this isn't fully fleshed out and won't error if you specify a layout that
  // extends beyond the row capacity. It will, however, not allow users to drag/resize
  // an item past the barrier. They can push items beyond the barrier, though.
  // Intentionally not documented for this reason.
  maxRows:  PropTypes.number,

  //
  // Flags
  //
  isDraggable:  PropTypes.bool,
  isResizable:  PropTypes.bool,
  // If true, grid items won't change position when being dragged over.
  preventCollision:  PropTypes.bool,
  // Use CSS transforms instead of top/left
  useCSSTransforms:  PropTypes.bool,

  //
  // Callbacks
  //

  // Callback so you can save the layout. Calls after each drag & resize stops.
  onLayoutChange:  PropTypes.func,

  // Calls when drag starts. Callback is of the signature (layout, oldItem, newItem, placeholder, e, ?node).
  // All callbacks below have the same signature. 'start' and 'stop' callbacks omit the 'placeholder'.
  onDragStart:  PropTypes.func,
  // Calls on each drag movement.
  onDrag:  PropTypes.func,
  // Calls when drag is complete.
  onDragStop:  PropTypes.func,
  //Calls when resize starts.
  onResizeStart:  PropTypes.func,
  // Calls when resize movement happens.
  onResize:  PropTypes.func,
  // Calls when resize is complete.
  onResizeStop:  PropTypes.func,

  //
  // Other validations
  //

  // Children must not have duplicate keys.
  children:  function(props: Props, propName: string) {
    const children = props[propName];

    // Check children keys for duplicates. Throw if found.
    var keys = {};
    React.Children.forEach(children, function(child) {
      if (keys[child.key]) {
        throw new Error(
          'Duplicate child key "' +
            child.key +
            '" found! This will cause problems in ReactGridLayout.'
        );
      }
      keys[child.key] = true;
    });
  }
};

ReactGridLayout.defaultProps = {
  autoSize:  true,
  cols:  12,
  className:  '',
  style:  {},
  draggableHandle:  '',
  draggableCancel:  '',
  containerPadding:  null,
  rowHeight:  150,
  maxRows:  Infinity, // infinite vertical growth
  layout:  [],
  margin:  [10, 10],
  isDraggable:  true,
  isResizable:  true,
  useCSSTransforms:  true,
  verticalCompact:  true,
  compactType:  'vertical',
  preventCollision:  false,
  onLayoutChange:  noop,
  onDragStart:  noop,
  onDrag:  noop,
  onDragStop:  noop,
  onResizeStart:  noop,
  onResize:  noop,
  onResizeStop:  noop
};


export default ReactGridLayout;
