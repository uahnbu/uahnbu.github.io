class Matrix {
  constructor(rows_num,cols_num,rand) {
    if (typeof cols_num === 'undefined') {
      this.data = rows_num;
      this.size = [rows_num.length, rows_num[0].length];
    } else {
      let i, j;
      this.data = Array(rows_num);
      for (i = rows_num - 1; i >= 0; i--) {
        this.data[i] = Array(cols_num);
        for (j = cols_num - 1; j >= 0; j--) {
          this.data[i][j] = rand === true ? Math.random() * 2 - 1 : rand ? rand : 0;
        }
      }
      this.size = [rows_num, cols_num];
    }
  }

  map(func) {
    let i, j;
    for (i = this.size[0] - 1; i >= 0; i--) {
      for (j = this.size[1] - 1; j >= 0; j--) {
        this.data[i][j] = func(this.data[i][j], i, j);
      }
    }
    return this;
  }

  add(m) {
    let cols_num = this.size[1],
        i, j;
    if (m instanceof Matrix) {
      if (m.size[0] === this.size[0]) {
        let m_data = m.data,
            cur;
        for (i = this.size[0] - 1; i >= 0; i--) {
          cur = m_data[i];
          for (j = cols_num - 1; j >= 0; j--) {
            this.data[i][j] += m.size[1] === cols_num ? cur[j] : cur[0];
          }
        }
      } else if (m.size[0] === 1 && m.size[1] === this.size[1]) {
        let m_data = m.data;
        for (i = this.size[0] - 1; i >= 0; i--) {
          for (j = cols_num - 1; j >= 0; j--) {
            this.data[i][j] += m_data[0][j];
          }
        }
      } else {throw 'Can\'t add matrices with difference sizes'; }
    } else {
      for (i = this.size[0] - 1; i >= 0; i--) {
        for (j = cols_num - 1; j >= 0; j--) {
          this.data[i][j] += m;
        }
      }
    }
    return this;
  }

  sub(m) {
    let cols_num = this.size[1],
        i, j;
    if (m instanceof Matrix) {
      if (m.size[0] === this.size[0]) {
        let m_data = m.data,
            cur;
        for (i = this.size[0] - 1; i >= 0; i--) {
          cur = m_data[i];
          for (j = cols_num - 1; j >= 0; j--) {
            this.data[i][j] -= m.size[1] === cols_num ? cur[j] : cur[0];
          }
        }
      } else if (m.size[0] === 1 && m.size[1] === this.size[1]) {
        let m_data = m.data;
        for (i = this.size[0] - 1; i >= 0; i--) {
          for (j = cols_num - 1; j >= 0; j--) {
            this.data[i][j] -= m_data[0][j];
          }
        }
      } else {throw 'Can\'t substract matrices with difference sizes'; }
    } else {
      for (i = this.size[0] - 1; i >= 0; i--) {
        for (j = cols_num - 1; j >= 0; j--) {
          this.data[i][j] -= m;
        }
      }
    }
    return this;
  }

  mul(m) {
    let cols_num = this.size[1],
        i, j;
    if (m instanceof Matrix) {
      if (m.size[0] === this.size[0]) {
        let m_data = m.data,
            cur;
        for (i = this.size[0] - 1; i >= 0; i--) {
          cur = m_data[i];
          for (j = cols_num - 1; j >= 0; j--) {
            this.data[i][j] *= m.size[1] === cols_num ? cur[j] : cur[0];
          }
        }
      } else if (m.size[0] === 1 && m.size[1] === this.size[1]) {
        let m_data = m.data;
        for (i = this.size[0] - 1; i >= 0; i--) {
          for (j = cols_num - 1; j >= 0; j--) {
            this.data[i][j] *= m_data[0][j];
          }
        }
      } else {throw 'Can\'t Hadamard multiply matrices with difference sizes'; }
    } else {
      for (i = this.size[0] - 1; i >= 0; i--) {
        for (j = cols_num - 1; j >= 0; j--) {
          this.data[i][j] *= m;
        }
      }
    }
    return this;
  }
  
  div(m) {
    let cols_num = this.size[1],
        i, j;
    if (m instanceof Matrix) {
      if (m.size[0] === this.size[0]) {
        let m_data = m.data,
            cur;
        for (i = this.size[0] - 1; i >= 0; i--) {
          cur = m_data[i];
          for (j = cols_num - 1; j >= 0; j--) {
            this.data[i][j] /= m.size[1] === cols_num ? cur[j] : cur[0];
          }
        }
      } else if (m.size[0] === 1 && m.size[1] === this.size[1]) {
        let m_data = m.data;
        for (i = this.size[0] - 1; i >= 0; i--) {
          for (j = cols_num - 1; j >= 0; j--) {
            this.data[i][j] /= m_data[0][j];
          }
        }
      } else {throw 'Can\'t Hadamard multiply matrices with difference sizes'; }
    } else {
      for (i = this.size[0] - 1; i >= 0; i--) {
        for (j = cols_num - 1; j >= 0; j--) {
          this.data[i][j] /= m;
        }
      }
    }
    return this;
  }
  
  show() {
    console.table(this.data);
  }

  static map(mat,func) {
    let mat_new = new Matrix(mat.size[0], mat.size[1]),
        cols_num = mat.size[1] - 1,
        mat_data = mat.data,
        cur, i, j;
    for (i = mat.size[0] - 1; i >= 0; i--) {
      cur = mat_data[i];
      for (j = cols_num; j >= 0; j--) {
        mat_new.data[i][j] = func(cur[j], i, j);
      }
    }
    return mat_new;
  }

  static add(mat1,mat2) {
    let arr_new = Array(mat1.size[0]),
        mat1_data = mat1.data;
    for (let i = mat1.size[0] - 1; i >= 0; i--) {
      arr_new[i] = Array.from(mat1_data[i]);
    }
    let mat_new = new Matrix(arr_new);
    mat_new.add(mat2);
    return mat_new;
  }

  static sub(mat1,mat2) {
    let arr_new = Array(mat1.size[0]),
        mat1_data = mat1.data;
    for (let i = mat1.size[0] - 1; i >= 0; i--) {
      arr_new[i] = Array.from(mat1_data[i]);
    }
    let mat_new = new Matrix(arr_new);
    mat_new.sub(mat2);
    return mat_new;
  }

  static mul(mat1,mat2) {
    let arr_new = Array(mat1.size[0]),
        mat1_data = mat1.data;
    for (let i = mat1.size[0] - 1; i >= 0; i--) {
      arr_new[i] = Array.from(mat1_data[i]);
    }
    let mat_new = new Matrix(arr_new);
    mat_new.mul(mat2);
    return mat_new;
  }
  
  static div(mat1,mat2) {
    let arr_new = Array(mat1.size[0]),
        mat1_data = mat1.data;
    for (let i = mat1.size[0] - 1; i >= 0; i--) {
      arr_new[i] = Array.from(mat1_data[i]);
    }
    let mat_new = new Matrix(arr_new);
    mat_new.div(mat2);
    return mat_new;
  }

  static dot(mat1,mat2) {
    if (mat1.size[1] === mat2.size[0]) {
      let arr_new = Array(mat1.size[0]),
          cols_num = mat2.size[1],
          common = mat1.size[1] - 1,
          mat1_data = mat1.data,
          mat2_data = mat2.data,
          cur, i, j, k;
      for (i = mat1.size[0] - 1; i >= 0; i--) {
        arr_new[i] = Array(cols_num);
        cur = mat1_data[i];
        for (j = cols_num - 1; j >= 0; j--) {
          arr_new[i][j] = cur[0] * mat2_data[0][j];
          for (k = common; k > 0; k--) {
            arr_new[i][j] += cur[k] * mat2_data[k][j];
          }
        }
      }
      return new Matrix(arr_new);
    } else {throw 'Cols_num of matrix A must match rows_num of matrix B'; }
  }

  static t(mat) {
    let arr_new = Array(mat.size[1]),
        cols_num = mat.size[0] - 1,
        mat_data = mat.data,
        i, j;
    for (i = mat.size[1] - 1; i >= 0; i--) {
      arr_new[i] = Array(cols_num);
      for (j = cols_num; j >= 0; j--) {
        arr_new[i][j] = mat_data[j][i];
      }
    }
    return new Matrix(arr_new);
  }

  static sum(mat,axis) {
    let rows_num = mat.size[0] - 1,
        cols_num = mat.size[1] - 1,
        mat_data = mat.data,
        arr_new,
        i, j;
    if (axis === 'col') {
      let cur;
      arr_new = Array(mat.size[0]);
      for (i = rows_num; i >= 0; i--) {
        arr_new[i] = [mat_data[i][0]];
        cur = mat_data[i];
        for (j = cols_num; j > 0; j--) {
          arr_new[i][0] += cur[j];
        }
      }
      return new Matrix(arr_new);
    } else if (axis === 'row') {
      arr_new = Array(cols_num + 1);
      for (i = cols_num; i >= 0; i--) {
        arr_new[i] = mat_data[0][i];
        for (j = rows_num; j > 0; j--) {
          arr_new[i] += mat_data[j][i];
        }
      }
      return new Matrix([arr_new]);
    }
  }

  static max(mat,axis) {
    let rows_num = mat.size[0] - 1,
        cols_num = mat.size[1] - 1,
        mat_data = mat.data,
        arr_new,
        sum, i, j, k;
    if (axis === 'col') {
      let cur;
      arr_new = Array(mat.size[0]);
      for (i = rows_num; i >= 0; i--) {
        arr_new[i] = [mat_data[i][0]];
        cur = mat_data[i];
        for (j = cols_num; j > 0; j--) {
          if (cur[j] > arr_new[i][0]) {
            arr_new[i][0] = cur[j];
          }
        }
      }
      return new Matrix(arr_new);
    } else if (axis === 'row') {
      arr_new = Array(cols_num + 1);
      for (i = cols_num; i >= 0; i--) {
        arr_new[i] = mat_data[0][i];
        for (j = rows_num; j > 0; j--) {
          if (mat_data[j][i] > arr_new[i]) {
            arr_new[i] = mat_data[j][i];
          }
        }
      }
      return new Matrix([arr_new]);
    }
  }
}