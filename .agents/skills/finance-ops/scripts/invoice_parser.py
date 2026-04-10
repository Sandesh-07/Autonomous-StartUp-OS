import xml.etree.ElementTree as ET
import json
import sys


def parse_zugferd(xml_content):
    # Simplified parser for ZUGFeRD / XRechnung XML
    tree = ET.ElementTree(ET.fromstring(xml_content))
    root = tree.getroot()

    # Extracting core German tax data
    ns = {'ram': 'urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100'}

    amount = root.find('.//ram:DuePayableAmount', ns).text
    vendor = root.find('.//ram:SellerTradeParty/ram:Name', ns).text
    tax_percent = root.find('.//ram:CategoryRate', ns).text

    return {
        "vendor": vendor,
        "total_amount": float(amount),
        "vat_amount": round(float(amount) * (float(tax_percent)/100), 2),
        "is_zugferd": True
    }


if __name__ == "__main__":
    # In a real scenario, the agent passes the XML string here
    test_xml = sys.argv[1]
    print(json.dumps(parse_zugferd(test_xml)))
