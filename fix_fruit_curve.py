from sympy import symbols, Rational, Poly, expand
from typing import List, Tuple as TupleType, Optional

"""
Elliptic Curve Group Law on the dehomogenized fruit cubic

    x^3 + y^3 + xy + 1 = 3(x+y)(x+1)(y+1).

This code accepts an integer triple (a,b,c) with c != 0, sets
    x = a/c, y = b/c,
and checks whether (x,y) lies on the cubic.  If desired, it also warns when
(a,b,c) does not define a valid point of the original rational equation

    a/(b+c) + b/(a+c) + c/(a+b) = 4,

because clearing denominators can introduce extra points.

The elliptic curve group law is implemented directly on the smooth plane cubic,
using the flex O = (-1,0) as the identity.  The key fix versus the earlier
version is that lines are handled in general form

    A x + B y + C = 0,

so vertical secants and vertical tangents work correctly.
"""


# ============================================================
# CURVE DEFINITION
# ============================================================

def F(x, y):
    """Defining polynomial of the cubic."""
    return x**3 + y**3 + x*y + 1 - 3*(x + y)*(x + 1)*(y + 1)


def dF_dx(x, y):
    r"""Partial derivative \partial F / \partial x."""
    return 3*x**2 + y - 3*(y + 1)*(2*x + y + 1)


def dF_dy(x, y):
    r"""Partial derivative \partial F / \partial y."""
    return 3*y**2 + x - 3*(x + 1)*(x + 2*y + 1)


def is_on_curve(x, y):
    """Exact curve-membership test."""
    return expand(F(Rational(x), Rational(y))) == 0


# ============================================================
# ORIGINAL FRUIT EQUATION CHECK
# ============================================================

def is_valid_fruit_triple(a: int, b: int, c: int) -> bool:
    """Check that the original rational equation is defined."""
    return (a + b) != 0 and (a + c) != 0 and (b + c) != 0


def satisfies_original_fruit_equation(a: int, b: int, c: int) -> bool:
    """Check the original equation exactly when it is defined."""
    if not is_valid_fruit_triple(a, b, c):
        return False
    lhs = (Rational(a, b + c)
           + Rational(b, a + c)
           + Rational(c, a + b))
    return lhs == 4


# ============================================================
# LINE OPERATIONS (GENERAL FORM A x + B y + C = 0)
# ============================================================

def normalize_line(A, B, C):
    """Normalize line coefficients to exact rationals."""
    A, B, C = Rational(A), Rational(B), Rational(C)
    if A == 0 and B == 0:
        raise ValueError("Degenerate line with A = B = 0")
    return A, B, C


def tangent_line_at(x, y):
    """Tangent line at (x,y) in the form A x + B y + C = 0."""
    x, y = Rational(x), Rational(y)
    A = dF_dx(x, y)
    B = dF_dy(x, y)
    C = -(A*x + B*y)
    return normalize_line(A, B, C)


def secant_line_through(x1, y1, x2, y2):
    """Line through two distinct points in the form A x + B y + C = 0."""
    x1, y1, x2, y2 = map(Rational, (x1, y1, x2, y2))
    if x1 == x2 and y1 == y2:
        raise ValueError("Secant requires two distinct points")
    A = y1 - y2
    B = x2 - x1
    C = x1*y2 - x2*y1
    return normalize_line(A, B, C)


def format_line(A, B, C) -> str:
    """Human-readable line equation."""
    return f"({A})*x + ({B})*y + ({C}) = 0"


# ============================================================
# THIRD INTERSECTION WITH THE CUBIC
# ============================================================

def find_third_intersection_exact(x1, y1, x2, y2, verbose=False):
    """
    Find the third intersection of the cubic with the line through P1 and P2.

    If P1 = P2, uses the tangent line and counts P1 with multiplicity 2.
    Returns (x3, y3) as exact sympy Rational objects.
    """
    x1, y1, x2, y2 = map(Rational, (x1, y1, x2, y2))
    tangent_case = (x1 == x2 and y1 == y2)

    if tangent_case:
        A, B, C = tangent_line_at(x1, y1)
        mult1, mult2 = 2, 0
        if verbose:
            print(f"  Tangent at ({x1}, {y1}): {format_line(A, B, C)}")
    else:
        A, B, C = secant_line_through(x1, y1, x2, y2)
        mult1, mult2 = 1, 1
        if verbose:
            print(f"  Secant through ({x1}, {y1}) and ({x2}, {y2}): {format_line(A, B, C)}")

    # Non-vertical line: eliminate y.
    if B != 0:
        x = symbols('x')
        y_sub = (-A*x - C) / B
        cubic = expand(F(x, y_sub))
        poly = Poly(cubic, x, domain='QQ')
        coeffs = poly.all_coeffs()
        while len(coeffs) < 4:
            coeffs = [Rational(0)] + coeffs
        a3, a2, a1, a0 = coeffs[-4:]
        if a3 == 0:
            raise ValueError("Expected a cubic after substitution, but leading term vanished")

        sum_all_roots = -a2 / a3
        x3 = sum_all_roots - mult1*x1 - mult2*x2
        y3 = (-A*x3 - C) / B

        if verbose:
            print(f"  Cubic in x: {cubic}")
            print(f"  Sum of x-roots = {sum_all_roots}")
            print(f"  Third intersection: ({x3}, {y3})")
        return Rational(x3), Rational(y3)

    # Vertical line: x is constant, so eliminate x and solve in y.
    y = symbols('y')
    x_const = -C / A
    cubic = expand(F(x_const, y))
    poly = Poly(cubic, y, domain='QQ')
    coeffs = poly.all_coeffs()
    while len(coeffs) < 4:
        coeffs = [Rational(0)] + coeffs
    a3, a2, a1, a0 = coeffs[-4:]
    if a3 == 0:
        raise ValueError("Expected a cubic after vertical substitution, but leading term vanished")

    sum_all_roots = -a2 / a3
    y3 = sum_all_roots - mult1*y1 - mult2*y2
    x3 = x_const

    if verbose:
        print(f"  Vertical line x = {x_const}")
        print(f"  Cubic in y: {cubic}")
        print(f"  Sum of y-roots = {sum_all_roots}")
        print(f"  Third intersection: ({x3}, {y3})")
    return Rational(x3), Rational(y3)


# ============================================================
# GROUP LAW OPERATIONS
# ============================================================

IDENTITY = (Rational(-1), Rational(0))


def negate_point(x, y, verbose=False):
    """
    Negation with respect to the flex O = (-1,0):
    -P is the third intersection of the line through O and P.
    """
    x, y = Rational(x), Rational(y)
    if (x, y) == IDENTITY:
        return IDENTITY
    if verbose:
        print(f"  Finding -P from the line through O={IDENTITY} and P=({x}, {y})")
    return find_third_intersection_exact(IDENTITY[0], IDENTITY[1], x, y, verbose=verbose)


def add_points_exact(x1, y1, x2, y2, verbose=False):
    """Add two points using the tangent-secant law on the cubic."""
    P = (Rational(x1), Rational(y1))
    Q = (Rational(x2), Rational(y2))

    if P == IDENTITY:
        return Q
    if Q == IDENTITY:
        return P

    if verbose:
        print(f"  Adding P={P} + Q={Q}")

    R = find_third_intersection_exact(P[0], P[1], Q[0], Q[1], verbose=verbose)
    if verbose:
        print(f"  Third intersection R = {R}")
    S = negate_point(R[0], R[1], verbose=verbose)
    if verbose:
        print(f"  Sum P + Q = -R = {S}")
    return S


# ============================================================
# SCALAR MULTIPLICATION
# ============================================================

def multiply_point_scalar(n: int, px, py, verbose=False) -> List[TupleType[str, Rational, Rational]]:
    """Compute nP by repeated addition, keeping all intermediate multiples."""
    px, py = Rational(px), Rational(py)
    P = (px, py)

    if n == 0:
        return [("0P", IDENTITY[0], IDENTITY[1])]

    if n < 0:
        pos_steps = multiply_point_scalar(-n, px, py, verbose=verbose)
        _, rx, ry = pos_steps[-1]
        nx, ny = negate_point(rx, ry, verbose=verbose)
        pos_steps.append((f"{n}P", nx, ny))
        return pos_steps

    steps = [("1P", P[0], P[1])]
    current = P
    for i in range(2, n + 1):
        current = add_points_exact(current[0], current[1], P[0], P[1], verbose=verbose)
        steps.append((f"{i}P", current[0], current[1]))
    return steps


# ============================================================
# DISPLAY
# ============================================================

def print_point(label, x, y):
    print(f"  {label:>6} = ({x}, {y})")


def compute_and_trace_point(start_x, start_y, target_n):
    """Compute nP and print the full trace."""
    steps = multiply_point_scalar(target_n, start_x, start_y, verbose=True)
    print("\n" + "=" * 70)
    print("COMPUTATION SEQUENCE")
    print("=" * 70)
    for label, x, y in steps:
        print_point(label, x, y)
    return steps


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":
    print("=" * 70)
    print("ELLIPTIC CURVE GROUP LAW")
    print("Curve: x^3 + y^3 + xy + 1 = 3(x+y)(x+1)(y+1)")
    print(f"Identity (chosen flex): O = {IDENTITY}")
    print("=" * 70)
    print()

    while True:
        print("STEP 1: Enter integers (a,b,c) with c != 0.")
        print("We then set x = a/c and y = b/c and work on the dehomogenized cubic.")
        print()
        try:
            a = int(input("Enter integer a: "))
            b = int(input("Enter integer b: "))
            c = int(input("Enter integer c (must be nonzero): "))

            if c == 0:
                print("❌ Error: c cannot be zero. Try again.\n")
                continue

            P_x = Rational(a, c)
            P_y = Rational(b, c)

            print(f"\nDehomogenized point P = ({P_x}, {P_y})")

            if not is_on_curve(P_x, P_y):
                print("❌ This point is not on the cubic. Please try again.\n")
                continue

            print("✓ P lies on the cubic.")

            if is_valid_fruit_triple(a, b, c):
                if satisfies_original_fruit_equation(a, b, c):
                    print("✓ The triple also satisfies the original fruit equation.\n")
                else:
                    print("⚠ The triple avoids zero denominators, but does not satisfy the original fruit equation.\n")
            else:
                print("⚠ Warning: this triple lands on the cleared cubic, but the original fruit equation")
                print("  is undefined because one of a+b, a+c, b+c is zero.\n")
            break

        except ValueError:
            print("❌ Invalid input. Please enter integers only.\n")

    print("=" * 70)
    print("STEP 2: Compute nP")
    print("=" * 70)
    print()

    while True:
        try:
            n_input = input("Enter integer n (or 'quit' to exit): ").strip()
            if n_input.lower() in {"quit", "q", "exit"}:
                print("\nGoodbye!")
                break

            n = int(n_input)
            print()
            print(f"Computing {n}P...")
            print("=" * 70)
            steps = compute_and_trace_point(P_x, P_y, n)
            final_label, final_x, final_y = steps[-1]
            print()
            print(f"RESULT: {final_label} = ({final_x}, {final_y})")
            print()

        except ValueError:
            print("❌ Invalid input. Please enter an integer.\n")
        except (EOFError, KeyboardInterrupt):
            print("\n\nGoodbye!")
            break
