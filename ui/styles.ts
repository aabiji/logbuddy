import { StyleSheet } from "react-native";

export const colors = {
  background: "#FFFFFF",
  primary: "#78C247",
  secondary: "#38853F",
  onSurface: "#061123",
  onPrimary: "#ffffff",
  error: "#DE1010",
  grey: {
    100: "#F5F5F5",
    200: "#E9E9EC",
    300: "#C9C9CF",
    400: "#94949E",
    500: "#575761",
  }
};

export const theme = StyleSheet.create({
  button: {
    padding: 10,
    borderRadius: 8.
  },
  centeredButton: {
    width: "90%",
    marginHorizontal: "auto",
  },
  buttonLabel: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold"
  },
  container: {
    padding: 15,
    flex: 1,
    backgroundColor: colors.background,
  },
  row: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },
  rowColumn: {
    width: "33%",
    textAlign: "center"
  },
  h1: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.onSurface,
  },
  h3: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.onSurface,
  },
  h4: {
    fontSize: 17,
    fontWeight: "bold",
    color: colors.onSurface,
  },
  dimmedHeader: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.grey[400],
  },
  input: {
    backgroundColor: colors.grey[200],
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginHorizontal: "auto",
    width: "auto",
    borderRadius: 8,
  },
  errorMessage: {
    textAlign: "center",
    color: colors.error,
    fontWeight: "bold",
    marginBottom: 20,
  },
  slideableIconButton: {
    flex: 1,
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  gridRow: { backgroundColor: colors.grey[100] },
  topSpacer: { marginBottom: 16 },
  bottomSpacer: { marginBottom: 16 },
});

export default theme;