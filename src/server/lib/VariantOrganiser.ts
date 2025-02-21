import { GAP_COLUMN_DEFAULT, GAP_ROW_DEFAULT } from "@lib/constants";
import { base64ArrayBuffer } from "./base64";
import { ComponentCache } from "./ComponentCache";
import { Configuration } from "./Configuration";

interface IUpdateTableConfig {
  id: number;
  value: string;
  columnGap: number;
  rowGap: number;
}
export interface ITreeConfig {
  tree: object;
  config: (string | undefined)[];
}
interface IIndex {
  relative: number;
  absolute: number;
}

interface IComponentLayout {
  mainRow: number;
  row: number;
  column: number;
  index: number;
  maxSize: { width: number; height: number };
  layout: string;
  node: ComponentNode;
  cache: ComponentCache;
  previousLength: { width: number; height: number };
}

interface IColumnTracker {
  column: number;
}

type TreeMatrix = (ComponentCache | undefined)[][][][];

export class VariantOrganiser {
  cache: { [key: string]: ComponentCache[] } = {};
  config: Configuration<string> = new Configuration(4);
  current = {};
  activeComponent: Partial<ComponentSetNode> | undefined;
  #groupCount = 0;

  columnGap: number = GAP_COLUMN_DEFAULT;
  columnGroupGap: number = 2 * GAP_COLUMN_DEFAULT;

  rowGap: number = GAP_ROW_DEFAULT;
  rowGroupGap: number = 2 * GAP_ROW_DEFAULT;

  /**
   * Put the component in cache if doesn't exist (and generate preview)
   */
  async init(set: Partial<ComponentSetNode>) {
    if (!set.id || !set.children) return;
    this.activeComponent = set;

    if (!this.cache[set.id]) {
      this.cache[set.id] = await Promise.all(
        set.children.map(
          async (item) =>
            new ComponentCache({
              name: item.name,
              id: item.id,
              preview: "", //await this.loadPreview(item) NOTE: UNUSED FOR NOW,
              position: { x: item.x, y: item.y },
              size: { width: item.width, height: item.height },
            }),
        ),
      );
    }
  }

  private traverse<T>({
    tree,
    onLast,
    onBeforeLast,
    level = 0,
    index = { relative: 0, absolute: 0 },
    length = this.config.filter().length,
  }: {
    tree: T[];
    onLast?: (group: T[], index: IIndex, level: number) => any;
    onBeforeLast?: (tree: Object, index: IIndex, level: number) => any;
    readonly level?: number;
    readonly index?: IIndex;
    length?: number;
  }) {
    //check if last level
    if (level == length) {
      this.#groupCount++;
      if (onLast) onLast(tree, index, level);
    } else {
      if (
        onBeforeLast &&
        ((length > 1 && level == length - 1) || length == 1)
      ) {
        onBeforeLast(tree, index, level);
      }
      level++;
      Object.keys(tree).forEach((key, i) =>
        this.traverse({
          tree: tree[key as keyof typeof tree] as T[],
          onLast,
          onBeforeLast,
          level: level,
          index: { relative: i, absolute: this.#groupCount },
          length,
        }),
      );
    }
  }

  private tree(
    children: ComponentCache[],
    keys: string[],
    parent: any = {},
    fullpath: string[] = [],
  ) {
    const [currentKey, ...rest] = keys.slice(0);

    //filter out children that does not belong to the branch from fullpath (previous branch)
    if (!!fullpath.length) {
      children = children.filter(({ name }) => {
        let match = 0;
        for (const path of fullpath) {
          if (name.match(path)) match++;
        }
        return match == fullpath.length;
      });
    }

    //Either append the child components in the right branch of dig more
    children.forEach((child) => {
      const nameObj = child.nameObject;

      for (const k in nameObj) {
        if (k === currentKey) {
          const value = nameObj[k]; //nameObj[k];
          if (!!rest.length) {
            parent[value] = this.tree(
              children,
              rest,
              parent[k as keyof typeof parent],
              [...fullpath, `${currentKey}=${value}`],
            ); //append new variants
          } else {
            if (parent[value]) parent[value].push(child);
            else parent[value] = [child];
          }
        }
      }
    });

    return parent;
  }

  /**
   * Organise cache raw data into an ordered table depending on the current configuration
   */
  private cache2Tree(reverse: boolean = false) {
    if (
      !this.activeComponent ||
      !this.activeComponent.id ||
      !this.cache[this.activeComponent.id]
    )
      return;

    const component = this.cache[this.activeComponent.id];

    /**
     * Build Tree of component
     * Build children tree depending on the configuration data ([State 1, State 2, State 3...])
     * Reverse the array because to fit HTML table structure we fist need the rows (which are the second parameters in our UI)
     * <row><col1><col2><coln></row>
     * Such structure implies that we want our final content to end in the column, not the row, hence the reverse
     *
     */

    const list = this.config.data.filter((n) => !!n);
    const tree = this.tree(
      component,
      (reverse ? list.reverse() : list) as string[],
    );

    return tree;
  }

  private async loadPreview(node: SceneNode): Promise<string> {
    const bytes = await node.exportAsync({
      format: "PNG",
      constraint: { type: "WIDTH", value: 100 },
    });

    let binary = "";
    for (var i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    return base64ArrayBuffer(bytes);
  }

  private async resizeFitComponent(bounds?: Rect) {
    const node = await figma.getNodeByIdAsync(String(this.activeComponent?.id));
    if (node && node.type == "COMPONENT_SET") {
      const initClip = node.clipsContent;

      node.clipsContent = false;
      let { width, height } = bounds ||
        node.absoluteRenderBounds || { width: undefined, height: undefined };
      if (width && height) node.resizeWithoutConstraints(width, height);
      node.clipsContent = initClip;
    }
  }

  destroy() {}

  alignMatrix(matrix: TreeMatrix): TreeMatrix {
    /*
	1. traverse matrix column by column
	2. check highest column length
	3. pad the smaller column by adding undefined value
    */

    matrix.forEach((mainRow) => {
      if (!!!mainRow.length) return;

      let columnCount = mainRow
        .map((row) => row?.length || 0)
        .reduce((a, b) => Math.max(a, b));

      // get max column length
      let maxColumnLength: number[] = new Array(columnCount).fill(0);

      for (let row = 0; row < mainRow.length; row++) {
        for (let col = 0; col < columnCount; col++) {
          maxColumnLength[col] = Math.max(
            maxColumnLength[col],
            mainRow[row][col]?.length || 0,
          );
        }
      }

      // add padding
      for (let row in mainRow) {
        for (let col = 0; col < mainRow[row].length; col++) {
          //cannot use in cause "in" skip undefined
          if (mainRow[row][col] == undefined) mainRow[row][col] = [];

          for (
            let u = 0;
            u < maxColumnLength[col] - mainRow[row][col].length;
            u++
          ) {
            mainRow[row][col].push(undefined);
          }

          if (maxColumnLength[col] !== mainRow[row][col].length) {
            //TODO: check why JS doesn't add more that 2 undefined in the list
            // Check "Sparse Array"
            // Need to manually add new undefined

            mainRow[row][col].push(undefined);
          }
        }
      }
    });

    return matrix;
  }

  layoutComponent({
    node,
    cache,
    maxSize,
    layout,
    mainRow,
    row,
    column,
    index,
    previousLength,
  }: IComponentLayout) {
    /*
	Overall structure:
	
	i = index
	
 	          column          column
	         __________ 	 __________ 
	   row	| i i i i |	| i i i i |
mainRow    row	| i i i i |	| i i i i |
           row	| i i i i |	| i i i i |
                '---------'     '---------'
	   
	         __________ 	 __________ 
	   row	| i i i i |	| i i i i |
mainRow    row	| i i i i |	| i i i i |
           row	| i i i i |	| i i i i |
                '---------'     '---------'

       */

    let x = cache.position.x;
    let y = cache.position.y;
    const previousBlock = {
      width:
        previousLength.width * (maxSize.width + this.columnGap) * column +
        this.columnGroupGap * (column * Math.min(1, column)),
      height:
        previousLength.height * (maxSize.height + this.rowGap) * mainRow +
        this.rowGroupGap * (mainRow * Math.min(1, mainRow)),
    };

    // layout components x and y based on configuration
    y = row * (maxSize.height + this.rowGap) + previousBlock.height;
    x = index * (maxSize.width + this.columnGap) + previousBlock.width;

    // assign position
    node.x = GAP_COLUMN_DEFAULT + x;
    node.y = GAP_ROW_DEFAULT + y;
  }

  translateColumns({
    source,
    destination,
    columnTracker,
    row,
    splitOnLevel,
    traverseLength,
  }: {
    source: ComponentCache[];
    destination: (ComponentCache | undefined)[][][];
    columnTracker: IColumnTracker;
    row?: number;
    splitOnLevel: number;
    traverseLength?: number;
  }) {
    /*
	                                       [
	                                        [A1,B1,C1],
     [[A1,A2,A3],[B1,B2,B3],[C1,C2,C3]]  ===>   [A2,B2,C2],
	                                        [A3,B3,C3]
	                                       ]
*/

    this.traverse<ComponentCache>({
      tree: source,
      ...(traverseLength && { length: traverseLength }),
      onBeforeLast: (comps, index) => {
        // receive array as comps
        if (Array.isArray(comps)) {
          for (let r = 0; r < (comps as ComponentCache[]).length; r++) {
            const component = comps[r as keyof typeof comps];
            //if argument row is provided, use it instead of the for loop index
            const realRow = row !== undefined ? row : r;

            if (!destination[realRow]) destination[realRow] = [];
            destination[realRow][columnTracker.column] = [
              ...(destination[realRow][columnTracker.column] || []),
              component,
            ];
          }

          if (index.relative == splitOnLevel) columnTracker.column++;
        }
      },
    });
  }

  async update(
    set: Partial<ComponentSetNode>,
    { id, value, columnGap, rowGap }: IUpdateTableConfig,
  ): Promise<ITreeConfig> {
    if (!set.id || !this.activeComponent?.id)
      return {
        config: [],
        tree: {},
      };

    // Update gaps
    if (this.columnGap !== columnGap) {
      this.columnGap = columnGap;
      this.columnGroupGap = 2 * this.columnGap;
    }

    if (this.rowGap !== rowGap) {
      this.rowGap = rowGap;
      this.rowGroupGap = 2 * this.rowGap;
    }

    //Update configuration array
    this.config.allocate(id, value);
    if (!this.config.filter().length)
      return {
        config: [],
        tree: {},
      };

    const { layout } = this.config;

    /*
	Init config is in order [col 1, col 2, row 1, row 2]
	We reverse the list order if cross, easier to read "in row"
	rather than translating columns to row
      */

    const tree = this.cache2Tree(!!layout.includes("CROSS"));

    /*
     ====== CONTEXT ======
   
     Arrange component differently depending on layout type from {Object} => [Table]
     { A: B: { [C],[D],[E] }} => [ [C] [D] [E] ]
     The current process first establishes a tree to segment the different types
     of components based on filters
          
     ====== ISSUE ======
     
     However the issue with this approach is that the output tree
     is completely "major order" agnostic.
     This is also due to the flexiblity of the plugin that allows
     a "column-only" or "row-only" layout, hence the necessity to store
     the components in a "neutral" structure either for rows or columns-only layout.
     
     Hence our output tree does not give any hints on how to layout its components,
     it simply dispatches them through distinct branches

     
      ====== SOLUTION ======
     
     The goal of the below method will be to transform the tree into
     a ROW-Major order matrix, so we shall reduce it's translation to table
     and the different approaches to lay out the components.
     
 
     ====== OBJECT TO MATRIX ARRANGEMENT ======

     Traverse the object and rearrange its content to fit a Row-Major order matrix
     (multi-dim array) in function of the layout configuration
     
     >> Handle 1D cases:
     Basically flatten the tree object
     And eventually translates the columns into rows
     
     >> Handle 2D cases (i.e. cross):
     Use the object structure to define our columns and row
     We separate each row entry into distinct columns
     meaning n0 = row, n > 0 = columns:
     row 1 [ [col 1] [col 2] ],
     row 2 [ [col 1] [col 2] ]
     
     Note: for consistency sake the ROW or COL (1D) layout will be the following
     row 1 [ [col 1] ]
     row 2 [ [col 2] ]
     ...
     
     TODO: Maybe do it directly in parallel of the tree creation
     so maybe don't even need tree anymore
     
     =========================================
    */

    this.#groupCount = 0;

    /*
	Store in object instead of separate variables cause JS can't pass int pimitives as reference
	And we need to keep track of the column.
	TODO: maybe find a better way to track the column.
    */

    const groups: TreeMatrix = [[], []];
    const columnTracker: IColumnTracker = {
      column: 0,
    };

    Object.keys(tree).forEach((key, rowIndex) => {
      const currentLevel = tree[key];

      switch (layout) {
        case "ROW":
          /*
	    Rows are already "row-ordered" so don't need any translation
	    Simply encapsulate it into a sub-array to fit convention
	    */

          groups[0].push([currentLevel]);
          break;

        case "COLUMN":
          /*
	    Columns requires translation
	  */
          this.translateColumns({
            source: currentLevel,
            destination: groups[0],
            columnTracker,
            splitOnLevel: 0,
          });
          break;

        case "CROSS_MONO":
          Object.keys(currentLevel).forEach((k) => {
            //go through columns (1 sub key (k) = 1 column)
            groups[0][rowIndex] = [
              ...(groups[0][rowIndex] || []),
              currentLevel[k],
            ];
          });
          break;

        case "CROSS_COL":
          this.translateColumns({
            source: currentLevel,
            destination: groups[0],
            columnTracker,
            row: rowIndex,
            splitOnLevel: 2,
          });
          break;

        case "CROSS_ROW":
        case "CROSS":
          Object.keys(currentLevel).forEach((key, subRowIndex) => {
            //get sub row index
            this.translateColumns({
              source: currentLevel[key],
              destination: groups[rowIndex],
              columnTracker,
              row: subRowIndex,
              splitOnLevel: 2,
              traverseLength: this.config.filter().length - 1,
            });
            columnTracker.column = 0;
          });

          break;
      }
      columnTracker.column = 0;
    });

    // cache bound box for later component set resizing
    let bounds: Rect = { x: 0, y: 0, width: 0, height: 0 };

    /*
	use a global "max size" instead of a
	"per row/col max", easier and faster to manage
	to maintain a grid layout
    */

    let maxSize: Rect = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };

    // assign greatest value to max size
    groups.forEach((mainRow) =>
      mainRow.forEach((row) =>
        row.forEach((col) =>
          col.forEach((item) => {
            maxSize = {
              ...maxSize,
              width: Math.max(maxSize.width, item?.size.width || 0),
              height: Math.max(maxSize.height, item?.size.height || 0),
            };
          }),
        ),
      ),
    );

    /*
	To ensure proper alignment ,we need to add padding to all the uneven columns
	 For this we simply add undefined value to compensate the padding and will
	 handle those undefined values consequently during the layout process
	 
	 [ [4] [3] [4] ]     [ [4] [3] [8] ] 
	 [ [3] [2] [8] ] ==> [ [4] [3] [8] ] 
	 [ [1] [1] [2] ]     [ [4] [3] [8] ]
	 
    */

    this.alignMatrix(groups);

    /*
      main layout loop:
      go through the groups to layout the components depending
      on their index in the array (row/ col)
    */

    //TODO: improve readability
    await Promise.all(
      groups.map(async (mainRow, mr) =>
        Promise.all(
          mainRow.map(async (row, r) => {
            return Promise.all(
              row.map(async (col, c) =>
                Promise.all(
                  col.map(async (child, k) => {
                    if (!child) return;

                    const node = await figma.getNodeByIdAsync(child.id);
                    if (node && node.type == "COMPONENT") {
                      // set component position
                      this.layoutComponent({
                        mainRow: mr,
                        row: r,
                        column: c,
                        index: k,
                        node: node,
                        cache: child,
                        maxSize,
                        layout,
                        previousLength: {
                          width: row[c - 1]?.length || 0,
                          height: groups[mr - 1]?.length || 0,
                        },
                      });

                      //update component set bounds for later resize component
                      bounds = {
                        ...bounds,
                        width: Math.max(
                          bounds.width,
                          node.x + child.size.width + GAP_COLUMN_DEFAULT,
                        ),
                        height: Math.max(
                          bounds.height,
                          node.y + child.size.height + GAP_ROW_DEFAULT,
                        ),
                      };
                    }
                  }),
                ),
              ),
            );
          }),
        ),
      ),
    );

    this.resizeFitComponent(bounds);

    return {
      config: this.config.data,
      tree,
    };
  }

  async reset() {
    if (
      !this.activeComponent ||
      !this.activeComponent.id ||
      !this.cache[this.activeComponent.id]
    )
      return;
    const component = this.cache[this.activeComponent.id];

    let bounds: Rect = { x: 0, y: 0, width: 0, height: 0 };
    //reset children to initial place
    await Promise.all(
      component.map(async (child) => {
        const node = await figma.getNodeByIdAsync(child.id);
        if (node && node.type == "COMPONENT") {
          node.x = child.position.x;
          node.y = child.position.y;
        }

        //update bounds for later resize component
        bounds = {
          ...bounds,
          width: Math.max(
            bounds.width,
            child.position.x + child.size.width + GAP_COLUMN_DEFAULT,
          ),
          height: Math.max(
            bounds.height,
            child.position.y + child.size.height + GAP_ROW_DEFAULT,
          ),
        };
      }),
    );

    this.resizeFitComponent(bounds);
  }
}
