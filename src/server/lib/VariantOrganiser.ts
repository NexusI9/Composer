import { Table } from "./Table";
import { base64ArrayBuffer } from "./base64";
import { ComponentCache } from "./ComponentCache";
import { Configuration } from "./Configuration";

interface IIndexKeyVal {
  id: number;
  value: string;
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
  row: number;
  column: number;
  index: number;
  maxSize: { width: number; height: number };
  layout: string;
  node: ComponentNode;
  cache: ComponentCache;
  previousLength: number;
}

type TreeMatrix = (ComponentCache | undefined)[][][];

export class VariantOrganiser {
  cache: { [key: string]: ComponentCache[] } = {};
  config: Configuration<string> = new Configuration(4);
  current = {};
  activeComponent: Partial<ComponentSetNode> | undefined;
  #groupCount = 0;
  margin: number = 20;
  columnGap: number = 2 * this.margin;

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
  }: {
    tree: T[];
    onLast?: (group: T[], index: IIndex) => any;
    onBeforeLast?: (tree: Object, index: IIndex) => any;
    readonly level?: number;
    readonly index?: IIndex;
  }) {
    const length = this.config.filter().length;

    //check if last level
    if (level == length) {
      this.#groupCount++;
      if (onLast) onLast(tree, index);
    } else {
      if (onBeforeLast && ((length > 1 && level == length - 1) || length == 1))
        onBeforeLast(tree, index);
      level++;
      Object.keys(tree).forEach((key, i) =>
        this.traverse({
          tree: tree[key as keyof typeof tree] as T[],
          onLast,
          onBeforeLast,
          level: level,
          index: { relative: i, absolute: this.#groupCount },
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

    let columnCount = matrix
      .map((row) => row.length)
      .reduce((a, b) => Math.max(a, b));

    // get max column length
    let maxColumnLength: number[] = new Array(columnCount).fill(0);
    for (let col = 0; col < columnCount; col++) {
      for (let row in matrix) {
        maxColumnLength[col] = Math.max(
          maxColumnLength[col],
          matrix[row][col].length,
        );
      }
    }

    // add padding
    for (let row in matrix) {
      for (let col in matrix[row]) {
        for (
          let u = 0;
          u < maxColumnLength[col] - matrix[row][col].length;
          u++
        ) {
          matrix[row][col].push(undefined);
        }
      }
    }

    return matrix;
  }

  layoutComponent({
    node,
    cache,
    maxSize,
    layout,
    row,
    column,
    index,
    previousLength,
  }: IComponentLayout) {
    let x = cache.position.x;
    let y = cache.position.y;

    // layout components x and y based on configuration
    y = row * (maxSize.height + this.margin);
    switch (layout) {
      case "COLUMN":
        x = column * (maxSize.width + this.margin);
        break;

      case "ROW":
        x = index * (maxSize.width + this.margin);
        break;

      case "CROSS_MONO": // 1 col + 1 row
      case "CROSS_COL": //2 column properties + 1 row
      case "CROSS_ROW": //2 rows properties + 1 col
      case "CROSS": //2 col + 2 row properties
        const previousBlockWidth =
          previousLength * (maxSize.width + this.margin) * column +
          this.columnGap * column * Math.min(1, column);

        x = index * (maxSize.width + this.margin) + previousBlockWidth;

        break;
    }

    // assign position
    node.x = this.margin + x;
    node.y = this.margin + y;
  }

  async update(
    set: Partial<ComponentSetNode>,
    { id, value }: IIndexKeyVal,
  ): Promise<ITreeConfig> {
    if (!set.id || !this.activeComponent?.id)
      return {
        config: [],
        tree: {},
      };

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
    console.log(tree);

    /**
     * ====== CONTEXT ======
     *
     * Arrange component differently depending on layout type from {Object} => [Table]
     * { A: B: { [C],[D],[E] }} => [ [C] [D] [E] ]
     * The current process first establishes a tree to segment the different types
     * of components based on filters
     *
     *
     * ====== ISSUE ======
     *
     * However the issue with this approach is that the output tree
     * is completely "major order" agnostic.
     * This is also due to the flexiblity of the plugin that allows
     * a "column-strict" layout, hence the necessity to store
     * the components in a "neutral" structure either for rows or columns-strict layout.
     *
     * Hence our output tree does not give any hints on how to layout its components,
     * it simply dispatches them through distinct branches
     *
     *
     * ====== SOLUTION ======
     *
     * The goal of the below method will be to transform the tree into
     * a ROW-Major order matrix, so we shall reduce it's translation to table
     * and the different approaches to lay out the components.
     *
     * */

    this.#groupCount = 0;
    const groups: TreeMatrix = [];
    let row = 0;
    let col = 0;

    /*
	====== OBJECT TO MATRIX ARRANGEMENT ======
	 
	Traverse the object and rearrange its content to fit a Row-Major order matrix
	(multi-dim array) in function of the layout configuration
	
	TODO: Maybe do it directly in parallel of the tree creation
	so maybe don't even need tree anymore
	
       =========================================
    */

    /*
      Handle 1D cases:
      Basically flatten the tree object
      And eventually translates the columns into rows
    */

    if (layout == "COLUMN" || layout == "ROW") {
      this.traverse<ComponentCache>({
        tree,
        onBeforeLast: (tree) => {
          for (const key in tree) {
            const value = tree[key as keyof typeof tree] as any;

            if (layout == "COLUMN") {
              /*
		  Columns requires translation
		For [[A1,A2,A3],[B1,B2,B3],[C1,C2,C3]] :
		  [
		  [A1,B1,C1],
		  [A2,B2,C2],
		  [A3,B3,C3]
		  ]
	      */
              for (let v = 0; v < value.length; v++) {
                if (!groups[v]) groups[v] = [];
                groups[v][col] = [value[v]];
              }
            } else if (layout == "ROW") {
              /*
		  Rows are already "row-ordered" so don't need any translation
		  Simply encapsulate it into a sub-array to fit convention
		*/
              groups.push([value]);
            }
            col++;
          }
          col = 0;
          row++;
        },
      });
    } else {
      /*
	  Handle 2D cases (i.e. cross):
	   Use the object structure to define our columns and row
	   We separate each row entry into distinct columns
	   meaning n0 = row, n > 0 = columns:
	   row 1 [ [col 1] [col 2] ],
	   row 2 [ [col 1] [col 2] ]

	   Note: for consistency sake the ROW or COL (1D) layout will be the following
	   row 1 [ [col 1] ]
	   row 2 [ [col 2] ]
	   ...
      */

      Object.keys(tree).forEach((key, row_index) => {
        const currentLevel = tree[key];
        // 2 rows cases
        // TODO: implement and check if cannot simplify the 1D case to put in it
        if (this.config.rows.length > 1) {
        } else {
          //go through columns (1 k = 1 column)
          Object.keys(currentLevel).forEach((k) => {
            groups[row_index] = [...(groups[row_index] || []), currentLevel[k]];
          });
        }
      });
    }

    // cache bound box for later component set resizing
    let bounds: Rect = { x: 0, y: 0, width: 0, height: 0 };

    /*
	for CROSS configuration, use a global "max size" instead of a
	"per row/col max", easier and faster to manage
	to maintain a grid layout
    */

    let maxSize: Rect = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };

    // assign greatest value
    groups.forEach((row) =>
      row.forEach((col) =>
        col.forEach((item) => {
          maxSize = {
            ...maxSize,
            width: Math.max(maxSize.width, item?.size.width || 0),
            height: Math.max(maxSize.height, item?.size.height || 0),
          };
        }),
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

    if (layout !== "ROW" && layout !== "COLUMN") this.alignMatrix(groups);

    /*
	main layout loop:
       go through the groups to layout the components depending
       on their index in the array (row/ col)
    */

    await Promise.all(
      groups.map(async (row, i) => {
        return Promise.all(
          row.map(async (col, j) =>
            Promise.all(
              col.map(async (child, k) => {
                if (!child) return;

                const node = await figma.getNodeByIdAsync(child.id);

                if (node && node.type == "COMPONENT") {
                  // set component position

                  this.layoutComponent({
                    row: i,
                    column: j,
                    index: k,
                    node: node,
                    cache: child,
                    maxSize,
                    layout,
                    previousLength: j > 0 ? row[j - 1]?.length || 0 : 0,
                  });

                  //update component set bounds for later resize component
                  bounds = {
                    ...bounds,
                    width: Math.max(
                      bounds.width,
                      node.x + child.size.width + this.margin,
                    ),
                    height: Math.max(
                      bounds.height,
                      node.y + child.size.height + this.margin,
                    ),
                  };
                }
              }),
            ),
          ),
        );
      }),
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
            child.position.x + child.size.width + this.margin,
          ),
          height: Math.max(
            bounds.height,
            child.position.y + child.size.height + this.margin,
          ),
        };
      }),
    );

    this.resizeFitComponent(bounds);
  }
}
