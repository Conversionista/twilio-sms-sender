<?php
    require_once "vendor/autoload.php";
    use Twilio\Rest\Client;
    $dotenv = new Dotenv\Dotenv(__DIR__);
    $dotenv->load();
    ini_set('display_errors','on');
    
    //header("Access-Control-Allow-Origin: api.conversionista.se");
    header("Access-Control-Allow-Origin: *");
    header('Content-Type: application/json');

    $domain = getenv('DOMAIN');

    /* Helper functions */
    function sendMessages($recipients, $message) {
        $recipients = json_decode($recipients);
        // var_dump($recipients);
        $people = array();
        foreach ($recipients as $key => $val) {
            // $arr[3] will be updated with each value from $arr...
            //echo $recipient["name"];
            $people['+' . trim($val->value)] = $val->name;

            
        }
        // var_dump($arr);
        
        global $domain;
        $AccountSid = getenv('ID');
        $AuthToken = getenv('TOKEN');
        

        $client = new Client($AccountSid, $AuthToken);
        foreach ($people as $number => $name) {

            $sms = $client->account->messages->create(

                // the number we are sending to - Any phone number
                $number,

                array(
                    // Step 6: Change the 'From' number below to be a valid Twilio number 
                    // that you've purchased
                    'from' => "+46769447513", 
                    
                    // the sms body
                    'body' => "Hej $name, " . $message
                )
            );

            // Display a confirmation message on the screen
            echo "Sent message to $name \n";
        }
        
    }

    function verifyIntegrity($token) {
        $ch = curl_init('https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' . $token);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        $data = curl_exec($ch);
        curl_close($ch);
        return $data;
    }

    function verifyUser($token) {
        
        global $domain;

        $d = json_decode( verifyIntegrity($token) );
        
        if( $d->{'hd'} == $domain ) {
            return true;
        } else {
            return false;
        }
        
    }
    
    /* Main logic */
    if ( isset($_GET['verifyUser']) && isset($_GET['sendMessages']) && isset($_GET['recipients']) && isset($_GET['message']) ) {
        $userToken = $_GET['verifyUser'];
        if( verifyUser($userToken) ) {

            sendMessages($_GET['recipients'], urldecode($_GET['message']) );

        } else {
            echo json_encode(['error_description' => 'Unauthorized user']); 
        }

    } elseif( isset($_GET['verifyUser']) ) {
        
        $userToken = $_GET['verifyUser'];
        
        if( verifyUser($userToken) ) {
            echo json_encode(['success' => 'User authorized']); 
        } else {
            echo json_encode(['error_description' => 'Unauthorized user']); 
        }

    } else {
        
        echo json_encode(['error_description' => 'User token is not provided']); 
    }