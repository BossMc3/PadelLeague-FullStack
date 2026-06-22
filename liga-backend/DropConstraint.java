import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class DropConstraint {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://aws-1-eu-west-2.pooler.supabase.com:5432/postgres?sslmode=require";
        String user = "postgres.ykiregetaczofsqjtbhg";
        String password = "Hg1X8SbAas0WuvkC";

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {
            
            stmt.executeUpdate("ALTER TABLE players DROP CONSTRAINT IF EXISTS players_role_check;");
            System.out.println("Constraint dropped successfully!");
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
