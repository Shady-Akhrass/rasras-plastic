import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class HashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println("BCrypt for 'password': " + encoder.encode("password"));
        System.out.println("BCrypt for '12345678': " + encoder.encode("12345678"));
    }
}
